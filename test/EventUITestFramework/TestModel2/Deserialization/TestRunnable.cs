using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public class TestRunnable
    {
        public TestRunnableType Type { get; set; } = TestRunnableType.None;

        public TestFileSelector Selector { get; set; } = null;

        public TestFailureMode FailureMode { get; set; } = TestFailureMode.Continue;
    }
}
