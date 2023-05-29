/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/


using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;

using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// The root of a test hierarchy, represents a new hierarchy if it is nested within another root's hierarchy.
    /// </summary>
    public class TestRoot : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.Root;

        /// <summary>
        /// The version of the API being used for all items under this root.
        /// </summary>
        public string Version { get; set; } = null;

        /// <summary>
        /// The description of the tests under this root. Used for logging purposes.
        /// </summary>
        public string Description { get; set; } = null;

        /// <summary>
        /// All of the declarations of items to their names to use within this hierarchy.
        /// </summary>
        public TestRootDeclarationSet Declarations { get; set; } = null;

        /// <summary>
        /// The specific dependencies to bring in for all the tests under this root.
        /// </summary>
        public List<TestDependency> Dependencies { get; } = new List<TestDependency>();

        /// <summary>
        /// Whether or not the root includes all .js files beneath it in the file hierarchy. Only applies if "run" is omitted.
        /// </summary>
        public bool Recursive { get; set; } = false;

        /// <summary>
        /// A list of items that are to be run directly under this root.
        /// </summary>
        public List<TestRunnable> Run { get; } = new List<TestRunnable>();

        /// <summary>
        /// A list of items that, if included in the "Run" or recursive search options, will be skipped.
        /// </summary>
        public List<TestRunnable> Skip { get; } = new List<TestRunnable>();
    }
}
