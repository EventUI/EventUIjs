/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel
{
    public class EventUITestDependency
    {
        public string Name { get; init; } = null;

        public string Path { get; set; } = null;

        public EventUITestDependency()
        {

        }
    }
}
