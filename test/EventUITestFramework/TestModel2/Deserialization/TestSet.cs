using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// Represents a hierarchical unit of tests that live under a test root.
    /// </summary>
    public class TestSet : INamedRunnableItem
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
        public List<TestDependency> Dependencies { get; } = new List<TestDependency>();

        /// <summary>
        /// Whether or not the set includes all .js files beneath it in the file hierarchy. Only applies if "run" is omitted.
        /// </summary>
        public bool Recursive { get; set; } = false;

        /// <summary>
        /// A list of items that are to be run directly under this set.
        /// </summary>
        public List<TestRunnable> Run { get; } = new List<TestRunnable>();

        /// <summary>
        /// A list of items that, if included in the "Run" or recursive search options, will be skipped.
        /// </summary>
        public List<TestRunnable> Skip { get; } = new List<TestRunnable>();
    }
}
