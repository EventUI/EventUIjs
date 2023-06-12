using EventUITestFramework.ParseModel;
using EventUITestFramework.TestModel.Deserialization;
using EventUITestFramework.TestModel.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Scanning
{
    public static class EVUITestFileScanner
    {
        public static async Task<TestExecutionSession> ScanDirectory(string rootDirectoryPath, TestScanOptions options)
        {
            if (String.IsNullOrWhiteSpace(rootDirectoryPath) == true) throw new ArgumentNullException(nameof(rootDirectoryPath) + " must be a valid string.");
            if (Directory.Exists(rootDirectoryPath) == false) throw new ArgumentException($"The provided file path '{rootDirectoryPath}' does not exist.");

            TestScanState state = new TestScanState();
            state.Options = (options != null) ? options : new TestScanOptions();
            state.ExecutionSession = new TestExecutionSession(rootDirectoryPath);

            ScanDirectory(rootDirectoryPath, state);

            await ReadFiles(state, ParseType.JSON);

            if (options.ScanJavaScriptFiles)
            {
                await ReadFiles(state, ParseType.JavaScript);
            }
        }

        private static void ScanDirectory(string directoryPath, TestScanState state)
        {
            DirectoryInfo dir = new DirectoryInfo(directoryPath);

            var allItems = dir.GetFileSystemInfos("*.js*", SearchOption.AllDirectories);

            Regex endsWithJS = new Regex("[^min]\\.js$", RegexOptions.IgnoreCase); //get all non-minified JS files (minified ones won't have tests in them)
            Regex minified = new Regex("\\.min\\.js$", RegexOptions.IgnoreCase);
            Regex endsWithJSON = new Regex("\\.h\\.json$", RegexOptions.IgnoreCase); //get all of our JSON files used to organize the tests in the JS files.

            foreach (var item in allItems)
            {
                if (endsWithJS.IsMatch(item.Extension))
                {
                    if (state.Options.JavaScriptFileFilter == null)
                    {
                        state.JavaScriptFiles.Add(item);
                    }
                    else
                    {
                        if (state.Options.JavaScriptFileFilter(item) == true) state.JavaScriptFiles.Add(item);
                    }
                }
                else if (minified.IsMatch(item.Extension))
                {
                    state.MinifiedJavaScriptFiles.Add(item);
                }
                else if (endsWithJSON.IsMatch(item.Extension))
                {
                    if (state.Options.JsonFileFilter == null)
                    {
                        state.JsonFiles.Add(item);
                    }
                    else
                    {
                        if (state.Options.JsonFileFilter(item) == true) state.JsonFiles.Add(item);
                    }
                }
            }
        }

        private static async Task ReadFiles(TestScanState state, ParseType parseType)
        {
            var batchTasks = new List<Task<ConcurrentBag<FileReadResult>>>();
            List<FileSystemInfo> currentBatch = new List<FileSystemInfo>();

            List<FileSystemInfo> filesList = null;

            if (parseType == ParseType.JSON)
            {
                filesList = state.JsonFiles;
            }
            else if (parseType == ParseType.JavaScript)
            {
                filesList = state.JavaScriptFiles;
            }
            else
            {
                return;
            }

            if (filesList == null) return;

            for (int x = 0; x < filesList.Count; x++)
            {
                currentBatch.Add(filesList[x]);

                if ((x != 0 && x % state.Options.FileBatchSize == 0) || (x == filesList.Count - 1))
                {
                    var readResults = await ReadFiles(currentBatch, parseType);
                    foreach (var item in readResults)
                    {
                        if (item.Error != null)
                        {
                            state.FileReadResults.Add(item);
                        }
                        else
                        {
                            state.FailedReadResults.Add(item);
                        }
                    }

                    currentBatch = new List<FileSystemInfo>();
                }
            }            
        }

        private static async Task<ConcurrentBag<FileReadResult>> ReadFiles(List<FileSystemInfo> fileSystemInfos, ParseType parseType)
        {
            var results = new ConcurrentBag<FileReadResult>();

            await Parallel.ForEachAsync(fileSystemInfos, async (source, token) =>
            {
                try
                {
                    Memory<byte> fileData = null;

                    using (var fs = new FileStream(source.FullName, FileMode.Open, FileAccess.Read, FileShare.Read))
                    {
                        fileData = new Memory<byte>(new byte[fs.Length]);
                        await fs.ReadAsync(fileData);
                    }

                    if (parseType == ParseType.JSON)
                    {
                        var deserializer = new JSONTestDeserializer();
                        var containers = deserializer.Deserialize(fileData.Span);
                        if (containers == null || containers.Count == 0) return;

                        foreach (var container in containers)
                        {
                            FileReadResult readResult = new FileReadResult(parseType);
                            readResult.FileInfo = source;
                            readResult.JsonParseResult = container;
                            results.Add(readResult);
                        }
                    }
                    else if (parseType == ParseType.JavaScript)
                    {
                        var parsed = EventUITestParseUtil.ParseFile(Encoding.UTF8.GetString(fileData.Span));
                        if (parsed != null)
                        {
                            results.Add(new FileReadResult(parseType)
                            {
                                FileInfo = source,
                                JavaScriptParseResult = parsed,
                                JsonParseResult = new TestFile()
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    FileReadResult readResult = new FileReadResult(parseType);
                    readResult.FileInfo = source;
                    readResult.Error = ex;

                    results.Add(readResult);
                }
            });

            return results;
        }       

        private TestRunnableWrapper MakeTestWrapper(FileReadResult readResult)
        {

        }

        private class TestScanState
        {
            /// <summary>
            /// The execution session being populated.
            /// </summary>
            public TestExecutionSession ExecutionSession { get; set; } = null;

            /// <summary>
            /// The options controlling the behavior of the scan.
            /// </summary>
            public TestScanOptions Options { get; set; } = null;

            /// <summary>
            /// All of the JS files found under the root that will be scanned for tests.
            /// </summary>
            public List<FileSystemInfo> JavaScriptFiles { get; set; } = null;

            /// <summary>
            /// JavaScript files that were found that are minified and not going to be scanned for tests.
            /// </summary>
            public List<FileSystemInfo> MinifiedJavaScriptFiles { get; set; } = null;

            /// <summary>
            /// All of the JSON files found under the root.
            /// </summary>
            public List<FileSystemInfo> JsonFiles { get; set; } = null;

            /// <summary>
            /// The read results of each file found in the scan.
            /// </summary>
            ConcurrentDictionary<string, TestRunnableWrapper> ReadItems { get; set; } = new ConcurrentDictionary<string, TestRunnableWrapper>();

            /// <summary>
            /// Read results that were successful.
            /// </summary>
            public ConcurrentBag<FileReadResult> FileReadResults { get; set; } = new ConcurrentBag<FileReadResult>();

            /// <summary>
            /// Read results that were failures.
            /// </summary>
            public ConcurrentBag<FileReadResult> FailedReadResults { get; set; } = new ConcurrentBag<FileReadResult>();
        }

        private class FileReadResult
        {
            public ParseType ParseType { get; } = ParseType.None;

            public FileSystemInfo FileInfo { get; set; } = null;

            public INamedRunnableItem JsonParseResult { get; set; } = null;

            public TokenContextInstance JavaScriptParseResult { get; set; } = null;

            public Exception Error { get; set; } = null;

            public FileReadResult(ParseType parseType)
            {
                ParseType = parseType;
            }
        }

        private enum ParseType
        {
            None = 0,
            JSON = 1, 
            JavaScript = 2
        };
    }
}
