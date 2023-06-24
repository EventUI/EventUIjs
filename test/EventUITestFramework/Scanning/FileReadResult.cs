/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Scanning
{
    /// <summary>
    /// The result of reading and parsing a file that contains either test structure JSON or JavaScript files with actual tests in them.
    /// </summary>
    public record FileReadResult
    {
        /// <summary>
        /// The type of content that was parsed.
        /// </summary>
        public ParseType ParseType { get; init; } = ParseType.None;

        /// <summary>
        /// The FileSystemInfo about the file that was read.
        /// </summary>
        public FileSystemInfo FileInfo { get; init; } = null;

        /// <summary>
        /// If the ParseType was JSON, this is the deserialized contents of the file.
        /// </summary>
        public INamedRunnableItem JsonParseResult { get; init; } = null;

        /// <summary>
        /// If the ParseType was JavaScript, this is the YoggTree token context instance that contains the parsed results of the file.
        /// </summary>
        public TokenContextInstance JavaScriptParseResult { get; init; } = null;

        /// <summary>
        /// If the file reading or parsing failed, this is the exception that was thrown.
        /// </summary>
        public Exception Error { get; init; } = null;
    }
}
