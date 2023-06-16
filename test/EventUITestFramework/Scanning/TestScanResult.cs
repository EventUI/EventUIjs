using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Scanning
{
    public class TestScanResult
    {
        /// <summary>
        /// The options controlling the behavior of the scan.
        /// </summary>
        public TestScanOptions Options { get; init; } = null;

        /// <summary>
        /// All of the JS files found under the root that will be scanned for tests.
        /// </summary>
        public ImmutableList<FileSystemInfo> JavaScriptFiles { get; init; } = null;

        /// <summary>
        /// JavaScript files that were found that are minified and not going to be scanned for tests.
        /// </summary>
        public ImmutableList<FileSystemInfo> MinifiedJavaScriptFiles { get; init; } = null;

        /// <summary>
        /// All of the JSON files found under the root.
        /// </summary>
        public ImmutableList<FileSystemInfo> JsonFiles { get; init; } = null;

        /// <summary>
        /// Read results that were successful.
        /// </summary>
        public ImmutableList<FileReadResult> FileReadResults { get; init; } = null;

        /// <summary>
        /// Read results that were failures.
        /// </summary>
        public ImmutableList<FileReadResult> FailedReadResults { get; init; } = null;
    }
}
