using EventUITestFramework.TestModel2;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework
{
    public static class TestHost
    {
        public static ConcurrentDictionary<string, TestExecutionSession> _sessions = new ConcurrentDictionary<string, TestExecutionSession>();


    }
}
