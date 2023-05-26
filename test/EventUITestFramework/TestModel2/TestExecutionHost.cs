using EventUITestFramework.TestModel2.Interfaces;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel2
{
    public class TestExecutionHost
    {
        public string OriginFilePath { get; } = null;

        public ConcurrentDictionary<string, INamedTestItem> NamedItems { get; } = new ConcurrentDictionary<string, INamedTestItem>();

        public TestExecutionWrapper Root { get; set; } = null;
    }
}
