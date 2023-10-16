/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace EventUITest
{
    public static class UnitTesting
    {
        public static async Task<TestManifest> GetManifest(string path)
        {
            using (var httpClient = new HttpClient())
            {
                using (var req = new HttpRequestMessage(HttpMethod.Get, path))
                {
                    using (var response = await httpClient.SendAsync(req))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            return JsonSerializer.Deserialize<TestManifest>(await response.Content.ReadAsStreamAsync());
                        }
                        else
                        {
                            throw new HttpRequestException("Failed to get TestManifest from " + path, null, response.StatusCode);
                        }
                    }
                }
            }
        }

        public static TestHostServerArgs GetHostArgs(TestManifest manifest, string rootPath)
        {
            if (manifest == null) throw new ArgumentNullException(nameof(manifest));
            if (manifest.runOrder == null || manifest.runOrder.Count == 0) throw new ArgumentNullException(nameof(manifest.runOrder));

            DirectoryInfo di = new DirectoryInfo(rootPath);
            var diWrapper = new DirectoryInfoWrapper(di);

            if (di.Exists == false) throw new DirectoryNotFoundException(rootPath);

            HashSet<string> existingFiles = new HashSet<string>();
            List<string> filesToRun = new List<string>();
            HashSet<string> excludedFiles = new HashSet<string>();  
            List<string> criticalFails = new List<string>();

            if (manifest.exclude?.Count > 0)
            {
                foreach (string exclusion in manifest.exclude)
                {
                    Matcher matcher = new Matcher(StringComparison.OrdinalIgnoreCase);
                    matcher.AddInclude(exclusion);

                    var result = matcher.Execute(diWrapper);
                    if (result == null) continue;

                    foreach (var file in result.Files)
                    {
                        excludedFiles.Add(file.Path);
                    }
                }
            }

            foreach (var globPattern in manifest.runOrder)
            {
                Matcher matcher = new Matcher(StringComparison.OrdinalIgnoreCase);
                matcher.AddInclude(globPattern);

                var result = matcher.Execute(diWrapper);
                if (result == null) continue;

                foreach (var file in result.Files)
                {
                   if (existingFiles.Contains(file.Path) == false && excludedFiles.Contains(file.Path) == false)
                    {
                        existingFiles.Add(file.Path);
                        filesToRun.Add(file.Path[0] == '/' ? "/" + EVUIConstants.HttpPath_EVUI_Test_Source + file.Path : "/" + EVUIConstants.HttpPath_EVUI_Test_Source + "/" + file.Path);
                    }
                }
            }

            if (manifest.criticalFails?.Count > 0)
            {
                foreach (var globPattern in manifest.criticalFails)
                {
                    Matcher matcher = new Matcher(StringComparison.OrdinalIgnoreCase);
                    matcher.AddInclude(globPattern);

                    var result = matcher.Execute(diWrapper);
                    if (result == null) continue;

                    foreach (var file in result.Files)
                    {
                        if (excludedFiles.Contains(file.Path) == false)
                        {
                            criticalFails.Add(file.Path);
                        }
                    }
                }
            }

            return new TestHostServerArgs()
            {
                runOrder = filesToRun,
                criticalFails = criticalFails,
                sessionId = Guid.NewGuid().ToString()
            };
        }


        public class TestHostServerArgs
        {
            public string sessionId { get; set; } = null;
            public List<string> runOrder { get; set; } = new List<string>();
            public List<string> criticalFails { get; set; } = new List<string>();
        };

        public class TestRunnerServerArgs
        {
            public string testFilePath { get; set; } = null;
        }

        public class TestManifest
        {
            public List<string> runOrder { get; set; } = new List<string>();

            public List<string> exclude { get; set; } = new List<string>();

            public List<string> criticalFails { get; set; } = new List<string>();
        }
    }


}
