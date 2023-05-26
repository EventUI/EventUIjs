using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    public class TestSet : INamedTestItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public string Description { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.Set;

        public List<TestDependency> Dependencies { get; } = new List<TestDependency>();

        public TestFailureMode FailureMode { get; set; } = TestFailureMode.Continue;

        public bool Recursive { get; set; } = false;

        public List<TestRunnable> Run { get; } = new List<TestRunnable>();

        public List<TestRunnable> Skip { get; } = new List<TestRunnable>();
    }
}
