using EventUITestFramework.TestModel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel
{
    public class EventUITest : IEventUITestChild
    {
        public string TestCode { get; set; } = null;

        public List<EventUITestDependency> Dependencies { get; } = new List<EventUITestDependency>();

        public IEventUITestContainer Parent { get; }

        public string Name { get; }

        public EventUITestItemType ItemType { get; } = EventUITestItemType.Test;

        public EventUITest(string name, IEventUITestContainer parent)
        {
            if (name == null) throw new ArgumentNullException("name");

            Name = name;
            Parent = parent;
        }
    }
}
