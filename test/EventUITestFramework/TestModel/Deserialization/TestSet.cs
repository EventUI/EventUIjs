/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/


using EventUITestFramework.TestModel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Deserialization
{
    /// <summary>
    /// Represents a hierarchical unit of tests that live under a test root.
    /// </summary>
    public class TestSet : ITestHierarchyContainer
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.Set;

        /// <summary>
        /// The description of the tests under this set. Used for logging purposes.
        /// </summary>
        public string Description { get; set; } = null;

        /// <summary>
        /// Should one of the items being selected fail, this is the behavior of the failure.
        /// </summary>
        public TestFailureMode FailureMode { get; set; } = TestFailureMode.Continue;

        /// <summary>
        /// The specific dependencies to bring in for all the tests under this root.
        /// </summary>
        public List<TestDependency> Dependencies { get; set; } = new List<TestDependency>();

        /// <summary>
        /// Whether or not the set includes all .js files beneath it in the file hierarchy. Only applies if "run" is omitted.
        /// </summary>
        public bool Recursive { get; set; } = false;

        /// <summary>
        /// A list of items that are to be run directly under this set.
        /// </summary>
        public List<TestRunnable> Run { get; set; } = new List<TestRunnable>();

        /// <summary>
        /// A list of items that, if included in the "Run" or recursive search options, will be skipped.
        /// </summary>
        public List<TestRunnable> Skip { get; set; } = new List<TestRunnable>();
    }
}
