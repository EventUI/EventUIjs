﻿using EventUITestFramework.TestModel2.Interfaces;

namespace EventUITestFramework.TestModel2
{
    /// <summary>
    /// Wrapper for an runnable test root, test set, test file, or test code.
    /// </summary>
    public class TestRunnableWrapper
    {
        public Guid ID { get; } = Guid.NewGuid();

        /// <summary>
        /// The session to which the testable item belongs to.
        /// </summary>
        public TestExecutionSession Session { get; } = null;

        /// <summary>
        /// The full path of the item on disk.
        /// </summary>
        public string FullPath { get; set; } = null;

        /// <summary>
        /// The ID's of all the dependencies used by this 
        /// </summary>
        public List<Guid> Dependencies { get; } = new List<Guid>();

        /// <summary>
        /// The deserialized object with the metadata about what is to be run.
        /// </summary>
        public INamedRunnableItem Runnable { get; } = null;

        /// <summary>
        /// All of the child runnables of this runnable.
        /// </summary>
        public List<TestRunnableWrapper> Children { get; } = new List<TestRunnableWrapper>();

        /// <summary>
        /// The parent runnable of this runnable.
        /// </summary>
        public TestRunnableWrapper Parent { get; } = null;
    }
}