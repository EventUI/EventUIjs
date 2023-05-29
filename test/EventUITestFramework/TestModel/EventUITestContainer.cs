/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

using EventUITestFramework.TestModel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.TestModel
{
    public class EventUITestContainer : IEventUITestContainer, IEventUITestFileSystemItem
    {
        public List<IEventUITestChild> Children { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public List<EventUITestDependency> Dependencies => throw new NotImplementedException();

        public IEventUITestContainer Parent { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

        public string Path => throw new NotImplementedException();

        public string Name => throw new NotImplementedException();

        public EventUITestItemType ItemType => throw new NotImplementedException();
    }
}
