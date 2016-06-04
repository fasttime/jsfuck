/* global Empty */

var expressParse;

(function ()
{
    'use strict';
    
    function evalExpr(expr)
    {
        var value = Function('return ' + expr)();
        return value;
    }
    
    function isReturnableIdentifier(identifier)
    {
        var returnable = UNRETURNABLE_WORDS.indexOf(identifier) < 0;
        return returnable;
    }
    
    function makeRegExp(richPattern)
    {
        var pattern = '^(?:' + replacePattern(richPattern) + ')';
        var regExp = RegExp(pattern);
        return regExp;
    }
    
    function read(parseInfo, regExp)
    {
        var data = parseInfo.data;
        var matches = regExp.exec(data);
        if (matches)
        {
            var match = matches[0];
            parseInfo.data = data.slice(match.length);
            return match;
        }
    }
    
    function readGroupLeft(parseInfo)
    {
        var groupCount = 0;
        while (readParenthesisLeft(parseInfo))
        {
            readSeparators(parseInfo);
            ++groupCount;
        }
        return groupCount;
    }
    
    function readGroupRight(parseInfo, groupCount)
    {
        while (groupCount--)
        {
            readSeparators(parseInfo);
            if (!readParenthesisRight(parseInfo))
                return;
        }
        return true;
    }
    
    function readParenthesisLeft(parseInfo)
    {
        return read(parseInfo, /^\(/);
    }
    
    function readParenthesisRight(parseInfo)
    {
        return read(parseInfo, /^\)/);
    }
    
    function readSeparators(parseInfo)
    {
        read(parseInfo, separatorRegExp);
    }
    
    function readUnit(parseInfo)
    {
        var groupCount = readGroupLeft(parseInfo);
        var unit = readUnitCore(parseInfo);
        if (unit)
        {
            if (groupCount)
            {
                if (!readGroupRight(parseInfo, groupCount))
                    return;
                parseInfo.composite = false;
            }
            return unit;
        }
    }
    
    function readUnitCore(parseInfo)
    {
        var unit;
        var strExpr = read(parseInfo, strRegExp);
        if (strExpr)
        {
            var str = evalExpr(strExpr);
            unit = { value: str };
            return unit;
        }
        var sign = read(parseInfo, /^[+-]?/);
        readSeparators(parseInfo);
        var groupCount = readGroupLeft(parseInfo);
        var constValueExpr = read(parseInfo, constValueRegExp);
        if (constValueExpr)
        {
            if (!readGroupRight(parseInfo, groupCount))
                return;
            var expr = sign + constValueExpr;
            var value = evalExpr(expr);
            parseInfo.composite = sign;
            unit = { value: value };
            return unit;
        }
        if (sign)
            return;
        var identifier = read(parseInfo, identifierRegExp);
        if (identifier && isReturnableIdentifier(identifier))
        {
            unit = { identifier: identifier };
            return unit;
        }
    }
    
    function replaceAndGroupToken(unused, tokenName)
    {
        var replacement = '(?:' + replaceToken(tokenName) + ')';
        return replacement;
    }
    
    function replacePattern(richPattern)
    {
        var pattern = richPattern.replace(/#(\w+)/g, replaceAndGroupToken);
        return pattern;
    }
    
    function replaceToken(tokenName)
    {
        var replacement = tokenCache[tokenName];
        if (replacement == null)
        {
            var richPattern = tokens[tokenName];
            tokenCache[tokenName] = replacement = replacePattern(richPattern);
        }
        return replacement;
    }
    
    var tokens =
    {
        ConstIdentifier:
            'Infinity|NaN|false|true|undefined',
        DecimalLiteral:
            '(?:(?:0|[1-9][0-9]*)(?:\\.[0-9]*)?|\\.[0-9]+)(?:[Ee][+-]?[0-9]+)?',
        DoubleQuotedString:
            '"(?:#EscapeSequence|(?!["\\\\]).)*"',
        EscapeSequence:
            '\\\\(?:u#HexDigit{4}|x#HexDigit{2}|[0-3]?[0-7]{2}|\r\n|[^ux])',
        HexDigit:
            '[0-9A-Fa-f]',
        HexIntegerLiteral:
            '0[Xx]#HexDigit+',
        NumericLiteral:
            '#DecimalLiteral|#HexIntegerLiteral',
        Separator:
            '#SeparatorChar|\\/\\/.*(?!.)|\\/\\*[\\s\\S]*?\\*\\/',
        SeparatorChar:
            '[\\s\uFEFF]', // U+FEFF is missed by /\s/ on Android Browsers < 4.1.x.
        SingleQuotedString:
            '\'(?:#EscapeSequence|(?![\'\\\\]).)*\'',
    };
    
    var tokenCache = new Empty();
    
    // This list includes reserved words and identifiers that would cause a change in a script's
    // behavior when placed after a return statement inside a Function invocation.
    // Unwanted changes include producing a syntax error where none is expected or a difference in
    // evaluation.
    var UNRETURNABLE_WORDS =
    [
        'arguments',
        'debugger',
        'delete',
        'if',
        'new',
        'return',
        'this',
        'throw',
        'typeof',
        'void',
        'while',
        'with',
    ];
    
    var constValueRegExp        = makeRegExp('(?:#NumericLiteral|#ConstIdentifier)(?![\\w$])');
    var identifierRegExp        = makeRegExp('[$A-Z_a-z][$0-9A-Z_a-z]*');
    var separatorOrColonRegExp  = makeRegExp('(?:#Separator|;)*');
    var separatorRegExp         = makeRegExp('#Separator*');
    var strRegExp               = makeRegExp('#SingleQuotedString|#DoubleQuotedString');
    
    expressParse =
        function (input)
        {
            var parseInfo = { data: input };
            read(parseInfo, separatorOrColonRegExp);
            var parseData = readUnit(parseInfo);
            if (!parseData)
                return;
            var ops = [];
            if (!parseInfo.composite)
            {
                for (;;)
                {
                    readSeparators(parseInfo);
                    var op;
                    if (readParenthesisLeft(parseInfo))
                    {
                        readSeparators(parseInfo);
                        if (readParenthesisRight(parseInfo))
                            op = { type: 'call' };
                        else
                        {
                            op = readUnit(parseInfo);
                            if (!op)
                                return;
                            readSeparators(parseInfo);
                            if (!readParenthesisRight(parseInfo))
                                return;
                            op.type = 'param-call';
                        }
                    }
                    else if (read(parseInfo, /^\[/))
                    {
                        readSeparators(parseInfo);
                        op = readUnit(parseInfo);
                        if (!op)
                            return;
                        readSeparators(parseInfo);
                        if (!read(parseInfo, /^]/))
                            return;
                        op.type = 'get';
                    }
                    else if (read(parseInfo, /^\./))
                    {
                        readSeparators(parseInfo);
                        var identifier = read(parseInfo, identifierRegExp);
                        if (!identifier)
                            return;
                        op = { type: 'get', value: identifier };
                    }
                    else
                        break;
                    ops.push(op);
                }
            }
            read(parseInfo, separatorOrColonRegExp);
            if (parseInfo.data)
                return;
            parseData.ops = ops;
            return parseData;
        };
}
)();
