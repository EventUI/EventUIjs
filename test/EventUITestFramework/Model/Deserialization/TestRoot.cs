﻿/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Deserialization
{
    /// <summary>
    /// The root of a test hierarchy, represents a new hierarchy if it is nested within another root's hierarchy.
    /// </summary>
    public class TestRoot : ITestHierarchyContainer
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
        public List<TestDependency> Dependencies { get; set; } = new List<TestDependency>();

        /// <summary>
        /// Whether or not the root includes all .js files beneath it in the file hierarchy. Only applies if "run" is omitted.
        /// </summary>
        public bool Recursive { get; set; } = false;

        /// <summary>
        /// A list of items that are to be run directly under this root.
        /// </summary>
        public List<TestRunnable> Run { get; set; } = new List<TestRunnable>();

        /// <summary>
        /// A list of items that, if included in the "Run" or recursive search options, will be skipped.
        /// </summary>
        public List<TestRunnable> Skip { get; set;} = new List<TestRunnable>();

        public static TestRoot FromSet(TestSet testSet)
        {
            if (testSet == null) return null;

            return new TestRoot()
            {
                Dependencies = testSet.Dependencies,
                Description = testSet.Description,
                Name = testSet.Name,
                Recursive = testSet.Recursive,
                Run = testSet.Run,
                Skip = testSet.Skip
            };
        }
    }
}