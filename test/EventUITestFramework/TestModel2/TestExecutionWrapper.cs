using EventUITestFramework.TestModel2.Interfaces;

namespace EventUITestFramework.TestModel2
{
    public class TestExecutionWrapper
    {
        public Guid ID { get; } = Guid.NewGuid();

        public TestExecutionHost Host { get; } = null;

        public string FullPath { get; set; } = null;

        public List<ResolvedTestDependency> Dependencies { get; } = new List<ResolvedTestDependency>();

        public INamedTestItem TestableItem { get; } = null;

        public List<TestExecutionWrapper> Children { get; } = new List<TestExecutionWrapper>();

        public TestExecutionWrapper Parent { get; } = null;
    }
}
