/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System.Collections.Concurrent;

namespace EventUITestFramework.Model.Tests
{
    /// <summary>
    /// Represents an island of state relating to the execution of a single test root.
    /// </summary>
    public class TestExecutionSession
    {
        /// <summary>
        /// The root path of the TestRoot object.
        /// </summary>
        public string RootFilePath { get; } = null;

        /// <summary>
        /// The mappings of full paths to their path aliases that were added as static content to the application at startup.
        /// </summary>
        public ConcurrentBag<RootPathMapping> PathMappings { get; } = new ConcurrentBag<RootPathMapping>();

        /// <summary>
        /// All of the named items that appeared under this root.
        /// </summary>
        public ConcurrentDictionary<string, INamedRunnableItem> NamedItems { get; } = new ConcurrentDictionary<string, INamedRunnableItem>();

        /// <summary>
        /// All of the resolved dependencies used by the tests under the root.
        /// </summary>
        public ConcurrentDictionary<Guid, ResolvedTestDependency> Dependencies { get; } = new ConcurrentDictionary<Guid, ResolvedTestDependency>();

        /// <summary>
        /// The TestRoot executable wrapper.
        /// </summary>
        public TestRunnableWrapper Root { get; internal set; } = null;

        internal TestExecutionSession(string rootFilePath)
        {
            RootFilePath = rootFilePath;
        }
    }
}
