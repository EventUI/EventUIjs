using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2.Deserialization
{
    /// <summary>
    /// Represents a segment of code from a TestFile to execute as its own test in isolation.
    /// </summary>
    public class TestCode : INamedRunnableItem
    {
        public Guid ID { get; } = Guid.NewGuid();

        public string Name { get; set; } = null;

        public TestRunnableType ItemType { get; } = TestRunnableType.TestCode;

        public string Code { get; set; } = null;
    }
}
