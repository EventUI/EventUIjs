using EventUITestFramework.TestModel2.Deserialization;

namespace EventUITestFramework.TestModel2
{
    /// <summary>
    /// Represents a dependency that has been resolved.
    /// </summary>
    public class ResolvedTestDependency
    {
        /// <summary>
        /// The ID of the dependency that has been resolved.
        /// </summary>
        public Guid DependencyID { get; } = Guid.NewGuid();

        /// <summary>
        /// The deserialized object from a JavaScript or JSON file.
        /// </summary>
        public TestDependency SourceDependency { get; } = null;

        /// <summary>
        /// The full path of the dependency file on disk.
        /// </summary>
        public string FullPath { get; } = null;
    }
}
