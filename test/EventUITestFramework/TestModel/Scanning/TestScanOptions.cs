using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Scanning
{
    public record TestScanOptions
    {
        /// <summary>
        /// Whether or not to open each JS file and parse out test metadata.
        /// </summary>
        public bool ScanJavaScriptFiles { get; init; } = false;

        public Predicate<FileSystemInfo> JavaScriptFileFilter { get; init; } = null;

        public Predicate<FileSystemInfo> JsonFileFilter { get; init; } = null;

        /// <summary>
        /// The maximum number of concurrent files that will be opened during the scan. Beware of making this a large number, there is an OS limit on the number of available file handles available to the computer. Default is 100.        /// </summary>
        public int FileBatchSize { get; init; } = 100;
    }
}
