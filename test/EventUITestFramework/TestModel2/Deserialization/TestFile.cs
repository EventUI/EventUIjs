/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.TestModel.Interfaces;
/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Deserialization
{
    /// <summary>
    /// Represents a file that contains actual test code.
    /// </summary>
    public class TestFile : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.File;

        /// <summary>
        /// The dependencies that are specific to this file.
        /// </summary>
        public List<TestDependency> Dependency { get; } = new List<TestDependency>();
    }
}
