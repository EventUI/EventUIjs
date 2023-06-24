/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Scanning
{
    /// <summary>
    /// The result of scanning a directory for test files.
    /// </summary>
    public record TestScanResult
    {
        /// <summary>
        /// The directory that was scanned.
        /// </summary>
        public string RootDirectory { get; init; } = null;

        /// <summary>
        /// The options controlling the behavior of the scan.
        /// </summary>
        public TestScanOptions Options { get; init; } = null;

        /// <summary>
        /// All of the JS files found under the root that will be scanned for tests.
        /// </summary>
        public ImmutableList<FileSystemInfo> JavaScriptFiles { get; init; } = ImmutableList<FileSystemInfo>.Empty;

        /// <summary>
        /// JavaScript files that were found that are minified and not going to be scanned for tests.
        /// </summary>
        public ImmutableList<FileSystemInfo> MinifiedJavaScriptFiles { get; init; } = ImmutableList<FileSystemInfo>.Empty;

        /// <summary>
        /// All of the JSON files found under the root.
        /// </summary>
        public ImmutableList<FileSystemInfo> JsonFiles { get; init; } = ImmutableList<FileSystemInfo>.Empty;

        /// <summary>
        /// Read results that were successful.
        /// </summary>
        public ImmutableList<FileReadResult> FileReadResults { get; init; } = ImmutableList<FileReadResult>.Empty;

        /// <summary>
        /// Read results that were failures.
        /// </summary>
        public ImmutableList<FileReadResult> FailedReadResults { get; init; } = ImmutableList<FileReadResult>.Empty;
    }
}
