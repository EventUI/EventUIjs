/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.TestModel;
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
