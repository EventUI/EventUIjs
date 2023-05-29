/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/


using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Runtime.Intrinsics.X86;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// Represents a container for the various options by which files may be selected.
    /// </summary>
    public class TestFileSelector
    {
        /// <summary>
        /// The relative or full path of the dependency code file.
        /// </summary>
        public string Path { get; set; } = null;

        /// <summary>
        /// A .NET glob pattern to select files to include.
        /// </summary>
        public string Glob { get; set; } = null;

        /// <summary>
        /// A .NET Regular expression pattern used to select file names that satisfy the expression. Use the JavaScript "/" notation to wrap the expression followed by the regex flags: "/myFile\.js/i" 
        /// </summary>
        public string Regex { get; set; } = null;

        /// <summary>
        ///  If an item was given an explicit alias to be referred to as (i.e. the "name" property of a file, set, or dependency), this is the name of the item to find.
        /// </summary>
        public string Alias { get; set; } = null;

        /// <summary>
        /// Whether or not the search should recursively drill down past the current directory. Only applies to Regex and Path selectors (if the path is a directory).
        /// </summary>
        public bool Recursive { get; set; } = true;
    }
}
