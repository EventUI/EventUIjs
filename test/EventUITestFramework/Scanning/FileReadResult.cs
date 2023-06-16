using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventUITestFramework.Scanning
{
    public record FileReadResult
    {
        public ParseType ParseType { get; } = ParseType.None;

        public FileSystemInfo FileInfo { get; init; } = null;

        public INamedRunnableItem JsonParseResult { get; init; } = null;

        public TokenContextInstance JavaScriptParseResult { get; init; } = null;

        public Exception Error { get; init; } = null;

        public FileReadResult(ParseType parseType)
        {
            ParseType = parseType;
        }
    }
}
