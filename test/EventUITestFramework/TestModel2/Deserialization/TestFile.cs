using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// Represents a file that contains actual test code.
    /// </summary>
    public class TestFile : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.File;

        /// <summary>
        /// The dependencies that are specific to this file.
        /// </summary>
        public List<TestDependency> Dependency { get; } = new List<TestDependency>();
    }
}
