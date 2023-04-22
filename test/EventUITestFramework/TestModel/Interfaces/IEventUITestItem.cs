using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel.Interfaces
{
    public interface IEventUITestItem
    {
        string Name { get; }

        EventUITestItemType ItemType { get; }
    }
}
