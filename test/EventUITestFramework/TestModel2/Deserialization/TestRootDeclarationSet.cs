using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// Represents a set of declarations where items are mapped to aliases.
    /// </summary>
    public class TestRootDeclarationSet
    {
        /// <summary>
        /// All of the dependencies to map.
        /// </summary>
        public List<TestDependency> Dependencies { get; } = new List<TestDependency>();
    }
}
