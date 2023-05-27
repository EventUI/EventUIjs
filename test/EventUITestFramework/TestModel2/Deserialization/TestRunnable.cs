using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// Represents a runnable item or set of items (test sets or test files).
    /// </summary>
    public class TestRunnable
    {
        /// <summary>
        /// The type of item being run.
        /// </summary>
        public TestRunnableType Type { get; set; } = TestRunnableType.None;

        /// <summary>
        /// The selection information about what is to be run.
        /// </summary>
        public TestFileSelector Selector { get; set; } = null;

        /// <summary>
        /// Should one of the items being selected fail, this is the behavior of the failure.
        /// </summary>
        public TestFailureMode FailureMode { get; set; } = TestFailureMode.Continue;
    }
}
