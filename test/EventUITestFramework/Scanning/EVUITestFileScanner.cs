/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.Text;

namespace EventUITestFramework.Scanning
{
    /// <summary>
    /// Utility to scan a directory for files related to running tests.
    /// </summary>
    public static class EVUITestFileScanner
    {
        /// <summary>
        /// Scans a directory for test JSON or JavaScript files.
        /// </summary>
        /// <param name="rootDirectoryPath">The root directory to scan under recursively.</param>
        /// <param name="options">Any options to use to control the scan operation.</param>
        /// <returns></returns>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="ArgumentException"></exception>
        public static async Task<TestScanResult> ScanDirectory(string rootDirectoryPath, TestScanOptions options)
        {
            if (String.IsNullOrWhiteSpace(rootDirectoryPath) == true) throw new ArgumentNullException(nameof(rootDirectoryPath) + " must be a valid string.");
            if (Directory.Exists(rootDirectoryPath) == false) throw new ArgumentException($"The provided file path '{rootDirectoryPath}' does not exist.");

            TestScanState result = new TestScanState();
            result.Options = (options != null) ? options : new TestScanOptions();

            //get and sort all the relevant file info 
            ScanDirectory(rootDirectoryPath, result);

            await ReadFiles(result, ParseType.JSON);

            if (options.ScanJavaScriptFiles)
            {
                await ReadFiles(result, ParseType.JavaScript);
            }

            return new TestScanResult()
            {
                FailedReadResults = result.FailedReadResults.ToImmutableList(),
                FileReadResults = result.FileReadResults.ToImmutableList(),
                JavaScriptFiles = result.JavaScriptFiles.ToImmutableList(),
                JsonFiles = result.JsonFiles.ToImmutableList(),
                MinifiedJavaScriptFiles = result.MinifiedJavaScriptFiles.ToImmutableList(),
                Options = result.Options
            };
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
                            state.FailedReadResults.Add(item);
                        }
                    }

                    currentBatch.Clear();
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
                            results.Add(new FileReadResult()
                            {
                                ParseType = parseType,
                                FileInfo = source,
                                JsonParseResult = container
                            });
                        }
                    }
                    else if (parseType == ParseType.JavaScript)
                    {
                        var parsed = EventUITestFileParser.GetFileTokens(Encoding.UTF8.GetString(fileData.Span));
                        if (parsed != null)
                        {
                            results.Add(new FileReadResult()
                            {
                                ParseType = parseType,
                                FileInfo = source,
                                JavaScriptParseResult = parsed,
                                JsonParseResult = new TestFile()
                            });
                        }
                    }
                }
                catch (Exception ex)
                {
                    results.Add(new FileReadResult()
                    {
                        ParseType = parseType,
                        FileInfo = source,
                        Error = ex
                    });
                }
            });

            return results;
        }

        private class TestScanState
        {
            /// <summary>
            /// The options controlling the behavior of the scan.
            /// </summary>
            public TestScanOptions Options { get; internal set; } = null;

            /// <summary>
            /// All of the JS files found under the root that will be scanned for tests.
            /// </summary>
            public List<FileSystemInfo> JavaScriptFiles { get; internal set; } = null;

            /// <summary>
            /// JavaScript files that were found that are minified and not going to be scanned for tests.
            /// </summary>
            public List<FileSystemInfo> MinifiedJavaScriptFiles { get; internal set; } = null;

            /// <summary>
            /// All of the JSON files found under the root.
            /// </summary>
            public List<FileSystemInfo> JsonFiles { get; internal set; } = null;

            /// <summary>
            /// Read results that were successful.
            /// </summary>
            public ConcurrentBag<FileReadResult> FileReadResults { get; internal set; } = new ConcurrentBag<FileReadResult>();

            /// <summary>
            /// Read results that were failures.
            /// </summary>
            public ConcurrentBag<FileReadResult> FailedReadResults { get; internal set; } = new ConcurrentBag<FileReadResult>();
        }
    }
}
