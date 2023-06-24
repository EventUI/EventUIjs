/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Scanning
{
    /// <summary>
    /// Options object for containing various settings relating to scanning directories for tests.
    /// </summary>
    public record TestScanOptions
    {
        /// <summary>
        /// Whether or not to open each JS file and parse out test metadata.
        /// </summary>
        public bool ScanJavaScriptFiles { get; init; } = false;

        /// <summary>
        /// A predicate function to decide whether or not to include a JavaScript file.
        /// </summary>
        public Predicate<FileSystemInfo> JavaScriptFileFilter { get; init; } = null;

        /// <summary>
        /// A predicate function to decide whether or not to include a JSON file.
        /// </summary>
        public Predicate<FileSystemInfo> JsonFileFilter { get; init; } = null;

        /// <summary>
        /// The maximum number of concurrent files that will be opened during the scan. Beware of making this a large number, there is an OS limit on the number of available file handles available to the computer. Default is 100.        /// </summary>
        public int FileBatchSize { get; init; } = 100;
    }
}
