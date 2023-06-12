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

        public int FileBatchSize { get; init; } = 25;
    }
}
