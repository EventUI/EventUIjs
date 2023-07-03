/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

namespace EventUITestFramework.Model.Parsing.Contexts
{
    /// <summary>
    /// Represents a run of literal text (between two double-quotes) that should not have any other tokens processed in it.
    /// </summary>
    public class EventUITestStringContext : TokenContextDefinition
    {
        public EventUITestStringContext()
            : base("StringContext")
        {
            AddToken<EventUIRawStringToken>();
            AddToken<BackslashToken>();
        }

        public override bool EndsCurrentContext(TokenInstance tokenInstance)
        {
            if (base.EndsCurrentContext(tokenInstance) == true)
            {
                if (tokenInstance.Contents.Span.SequenceEqual(tokenInstance.Context.StartToken.Contents.Span) == false) return false; //make sure it matches the start token
                if (tokenInstance.PeekPreviousToken().Is<BackslashToken>()) return false; //if it's escaped, we don't end the context.

                return true;
            }

            return false;
        }

        public override bool StartsNewContext(TokenInstance tokenInstance)
        {
            return false;
        }
    }
}
