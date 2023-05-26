using EventUITestFramework.TestModel2.Deserialization;

namespace EventUITestFramework.TestModel2
{
    public class ResolvedTestDependency
    {
        public Guid DependencyID { get; } = Guid.NewGuid();

        public TestDependency SourceDependency { get; } = null;

        public string FullPath { get; } = null;

        public string Code { get; } = null;
    }
}
