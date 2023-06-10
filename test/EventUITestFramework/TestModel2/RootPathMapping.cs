/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel
{
    /// <summary>
    /// Represents a mapping of a path alias to include static content to the asp application to its actual full path on disk.
    /// </summary>
    public class RootPathMapping
    {
        /// <summary>
        /// The alias that was registered with the application at startup as a source of static content.
        /// </summary>
        public string StaticContentAlias { get; set; } = null;

        /// <summary>
        /// The full path of the static content alias on disk.
        /// </summary>
        public string FullPath { get; set; } = null;
    }
}
