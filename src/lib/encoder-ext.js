/*
global
AMENDINGS,
APPEND_LENGTH_OF_DIGITS,
APPEND_LENGTH_OF_DIGIT_0,
APPEND_LENGTH_OF_PLUS_SIGN,
CREATE_PARSE_INT_ARG,
FROM_CHAR_CODE,
FROM_CHAR_CODE_CALLBACK_FORMATTER,
MAPPER_FORMATTER,
OPTIMAL_RETURN_STRING,
SIMPLE,
Encoder,
_Array_prototype_forEach,
_Array_prototype_map,
_Date,
_Error,
_Math_max,
_Object,
_Object_keys,
_RegExp,
assignNoEnum,
createEmpty,
createFigurator,
createParseIntArgDefault,
expressParse,
*/

var STRATEGIES;

var wrapWithCall;
var wrapWithEval;

(function ()
{
    function createReindexMap(count, radix, amendings, coerceToInt)
    {
        function getSortLength()
        {
            var length = 0;
            _Array_prototype_forEach.call
            (
                str,
                function (digit)
                {
                    length += digitAppendLengths[digit];
                }
            );
            return length;
        }

        var index;
        var digitAppendLengths = APPEND_LENGTH_OF_DIGITS.slice(0, radix || 10);
        var regExp;
        var replacer;
        if (amendings)
        {
            var firstDigit = radix - amendings;
            var pattern = '[';
            for (index = 0; index < amendings; ++index)
            {
                var digit = firstDigit + index;
                digitAppendLengths[digit] = SIMPLE[AMENDINGS[index]].appendLength;
                pattern += digit;
            }
            pattern += ']';
            regExp = _RegExp(pattern, 'g');
            replacer =
            function (match)
            {
                return AMENDINGS[match - firstDigit];
            };
        }
        var range = [];
        for (index = 0; index < count; ++index)
        {
            var str = coerceToInt && !index ? '' : index.toString(radix);
            var reindexStr = amendings ? str.replace(regExp, replacer) : str;
            var reindex = range[index] = _Object(reindexStr);
            reindex.sortLength = getSortLength();
            reindex.index = index;
        }
        range.sort
        (
            function (reindex1, reindex2)
            {
                var result =
                reindex1.sortLength - reindex2.sortLength || reindex1.index - reindex2.index;
                return result;
            }
        );
        return range;
    }

    function defineStrategy(strategy, minInputLength)
    {
        strategy.MIN_INPUT_LENGTH = minInputLength;
        return strategy;
    }

    function getDenseFigureLegendDelimiters(figurator, figures)
    {
        var delimiters = [FALSE_TRUE_DELIMITER];
        var lastFigure = figurator(figures.length - 1);
        var joiner = lastFigure.joiner;
        if (joiner != null)
            delimiters.push({ joiner: joiner, separator: joiner });
        return delimiters;
    }

    function getFrequencyList(inputData)
    {
        var freqList = inputData.freqList;
        if (!freqList)
        {
            var charMap = createEmpty();
            _Array_prototype_forEach.call
            (
                inputData,
                function (char)
                {
                    (
                        charMap[char] ||
                        (charMap[char] = { char: char, charCode: char.charCodeAt(), count: 0 })
                    )
                    .count++;
                }
            );
            var charList = _Object_keys(charMap);
            inputData.freqList =
            freqList =
            charList.map
            (
                function (char)
                {
                    var freq = charMap[char];
                    return freq;
                }
            )
            .sort
            (
                function (freq1, freq2)
                {
                    var diff = freq2.count - freq1.count || freq1.charCode - freq2.charCode;
                    return diff;
                }
            );
        }
        return freqList;
    }

    function getSparseFigureLegendDelimiters()
    {
        var delimiters = [FALSE_FREE_DELIMITER];
        return delimiters;
    }

    // The unit path consists of the string of colon-separated unit indices.
    function getUnitPath(unitIndices)
    {
        var unitPath = unitIndices.length ? unitIndices.join(':') : '0';
        return unitPath;
    }

    function initMinFalseFreeCharIndexArrayStrLength(input)
    {
        var minCharIndexArrayStrLength =
        _Math_max((input.length - 1) * (SIMPLE.false.length + 1) - 3, 0);
        return minCharIndexArrayStrLength;
    }

    function initMinFalseTrueCharIndexArrayStrLength()
    {
        return -1;
    }

    // Replaces a non-empty JavaScript array with a JSFuck array of strings.
    // Array elements may only contain characters with static definitions in their string
    // representations and may not contain the substring "false", because the value false is used as
    // a separator in the encoding.
    function replaceFalseFreeArray(array, maxLength)
    {
        var result = this.replaceStringArray(array, [FALSE_FREE_DELIMITER], maxLength);
        return result;
    }

    STRATEGIES =
    {
        byCharCodes:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var MAX_DECODABLE_ARGS = 65533; // limit imposed by Internet Explorer

                var input = inputData.valueOf();
                var long = input.length > MAX_DECODABLE_ARGS;
                var output = this.encodeByCharCodes(input, long, undefined, maxLength);
                return output;
            },
            2
        ),
        byCharCodesRadix4:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var input = inputData.valueOf();
                var output = this.encodeByCharCodes(input, undefined, 4, maxLength);
                return output;
            },
            31
        ),
        byDenseFigures:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDenseFigures(inputData, maxLength);
                return output;
            },
            2224
        ),
        byDict:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, undefined, undefined, maxLength);
                return output;
            },
            3
        ),
        byDictRadix3:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, 3, 0, maxLength);
                return output;
            },
            240
        ),
        byDictRadix4:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, 4, 0, maxLength);
                return output;
            },
            177
        ),
        byDictRadix4AmendedBy1:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, 4, 1, maxLength);
                return output;
            },
            312
        ),
        byDictRadix4AmendedBy2:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, 4, 2, maxLength);
                return output;
            },
            560
        ),
        byDictRadix5AmendedBy2:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, 5, 2, maxLength);
                return output;
            },
            756
        ),
        byDictRadix5AmendedBy3:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeByDict(inputData, 5, 3, maxLength);
                return output;
            },
            742
        ),
        bySparseFigures:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var output = this.encodeBySparseFigures(inputData, maxLength);
                return output;
            },
            328
        ),
        express:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var input = inputData.valueOf();
                var output = this.encodeExpress(input, maxLength);
                return output;
            }
        ),
        plain:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var input = inputData.valueOf();
                var options =
                {
                    bond:           inputData.bond,
                    forceString:    inputData.forceString,
                    maxLength:      maxLength,
                    optimize:       true,
                };
                var output = this.replaceString(input, options);
                return output;
            }
        ),
        text:
        defineStrategy
        (
            function (inputData, maxLength)
            {
                var input = inputData.valueOf();
                var wrapper = inputData.wrapper;
                var output = this.encodeAndWrapText(input, wrapper, undefined, maxLength);
                return output;
            }
        ),
    };

    var protoSource =
    {
        callGetFigureLegendDelimiters:
        function (getFigureLegendDelimiters, figurator, figures)
        {
            var figureLegendDelimiters = getFigureLegendDelimiters(figurator, figures);
            return figureLegendDelimiters;
        },

        callStrategies:
        function (input, options, strategyNames, unitPath)
        {
            var output;
            var inputLength = input.length;
            var perfLog = this.perfLog;
            var perfInfoList = [];
            perfInfoList.name = unitPath;
            perfInfoList.inputLength = inputLength;
            perfLog.push(perfInfoList);
            var inputData = _Object(input);
            _Object_keys(options).forEach
            (
                function (optName)
                {
                    inputData[optName] = options[optName];
                }
            );
            var usedPerfInfo;
            strategyNames.forEach
            (
                function (strategyName)
                {
                    var strategy = STRATEGIES[strategyName];
                    var perfInfo = { strategyName: strategyName };
                    var perfStatus;
                    if (inputLength < strategy.MIN_INPUT_LENGTH)
                        perfStatus = 'skipped';
                    else
                    {
                        this.perfLog = perfInfo.perfLog = [];
                        var before = new _Date();
                        var maxLength = output != null ? output.length : NaN;
                        var newOutput = strategy.call(this, inputData, maxLength);
                        var time = new _Date() - before;
                        this.perfLog = perfLog;
                        perfInfo.time = time;
                        if (newOutput != null)
                        {
                            output = newOutput;
                            if (usedPerfInfo)
                                usedPerfInfo.status = 'superseded';
                            usedPerfInfo = perfInfo;
                            perfInfo.outputLength = newOutput.length;
                            perfStatus = 'used';
                        }
                        else
                            perfStatus = 'incomplete';
                    }
                    perfInfo.status = perfStatus;
                    perfInfoList.push(perfInfo);
                },
                this
            );
            return output;
        },

        createCharCodesEncoding:
        function (charCodeArrayStr, long, radix)
        {
            var output;
            var fromCharCode = this.findDefinition(FROM_CHAR_CODE);
            if (radix)
            {
                output =
                this.createLongCharCodesOutput
                (charCodeArrayStr, fromCharCode, 'parseInt(undefined,' + radix + ')');
            }
            else
            {
                if (long)
                {
                    output =
                    this.createLongCharCodesOutput(charCodeArrayStr, fromCharCode, 'undefined');
                }
                else
                {
                    var returnString = this.findDefinition(OPTIMAL_RETURN_STRING);
                    var str = returnString + '.' + fromCharCode + '(';
                    output =
                    this.resolveConstant('Function') +
                    '(' +
                    this.replaceString(str, { optimize: true }) +
                    '+' +
                    charCodeArrayStr +
                    '+' +
                    this.resolveCharacter(')') +
                    ')()';
                }
            }
            return output;
        },

        createCharKeyArrayString:
        function (input, charMap, maxLength, delimiters)
        {
            var charKeyArray =
            _Array_prototype_map.call
            (
                input,
                function (char)
                {
                    var charKey = charMap[char];
                    return charKey;
                }
            );
            var charKeyArrayStr = this.replaceStringArray(charKeyArray, delimiters, maxLength);
            return charKeyArrayStr;
        },

        createDictEncoding:
        function (legend, charIndexArrayStr, maxLength, radix, amendings, coerceToInt)
        {
            var mapper;
            if (radix)
            {
                var parseIntArg;
                if (amendings)
                {
                    var firstDigit = radix - amendings;
                    var createParseIntArg;
                    if (amendings > 2)
                        createParseIntArg = this.findDefinition(CREATE_PARSE_INT_ARG);
                    else
                        createParseIntArg = createParseIntArgDefault;
                    parseIntArg = createParseIntArg(amendings, firstDigit);
                }
                else
                    parseIntArg = 'undefined';
                if (coerceToInt)
                    parseIntArg = '+' + parseIntArg;
                var formatter = this.findDefinition(MAPPER_FORMATTER);
                mapper = formatter('[parseInt(' + parseIntArg + ',' + radix + ')]');
            }
            else
                mapper = '"".charAt.bind';
            var output =
            this.createJSFuckArrayMapping(charIndexArrayStr, mapper, legend) + '[' +
            this.replaceString('join') + ']([])';
            if (!(output.length > maxLength))
                return output;
        },

        createJSFuckArrayMapping:
        function (arrayStr, mapper, legend)
        {
            var result =
            arrayStr + '[' + this.replaceString('map', { optimize: true }) + '](' +
            this.replaceExpr(mapper, true) + '(' + legend + '))';
            return result;
        },

        createLongCharCodesOutput:
        function (charCodeArrayStr, fromCharCode, arg)
        {
            var formatter = this.findDefinition(FROM_CHAR_CODE_CALLBACK_FORMATTER);
            var formatterExpr = formatter(fromCharCode, arg);
            var output =
            charCodeArrayStr + '[' + this.replaceString('map', { optimize: true }) + '](' +
            this.replaceExpr('Function("return ' + formatterExpr + '")()', true) + ')[' +
            this.replaceString('join') + ']([])';
            return output;
        },

        encodeAndWrapText:
        function (input, wrapper, unitPath, maxLength)
        {
            var output;
            if (!wrapper || input)
            {
                var forceString = !wrapper || wrapper.forceString;
                output = this.encodeText(input, false, forceString, unitPath, maxLength);
                if (output == null)
                    return;
            }
            else
                output = '';
            if (wrapper)
                output = wrapper.call(this, output);
            if (!(output.length > maxLength))
                return output;
        },

        encodeByCharCodes:
        function (input, long, radix, maxLength)
        {
            var cache = createEmpty();
            var charCodeArray =
            _Array_prototype_map.call
            (
                input,
                function (char)
                {
                    var charCode = cache[char] || (cache[char] = char.charCodeAt().toString(radix));
                    return charCode;
                }
            );
            var charCodeArrayStr = this.replaceFalseFreeArray(charCodeArray, maxLength);
            if (charCodeArrayStr)
            {
                var output = this.createCharCodesEncoding(charCodeArrayStr, long, radix);
                if (!(output.length > maxLength))
                    return output;
            }
        },

        encodeByDblDict:
        function
        (
            initMinCharIndexArrayStrLength,
            figurator,
            getFigureLegendDelimiters,
            keyFigureArrayDelimiters,
            inputData,
            maxLength
        )
        {
            var input = inputData.valueOf();
            var freqList = getFrequencyList(inputData);
            var charMap = createEmpty();
            var minCharIndexArrayStrLength = initMinCharIndexArrayStrLength(input);
            var figures =
            freqList.map
            (
                function (freq, index)
                {
                    var figure = figurator(index);
                    charMap[freq.char] = figure;
                    minCharIndexArrayStrLength += freq.count * figure.sortLength;
                    return figure;
                }
            );
            var dictChars =
            freqList.map
            (
                function (freq)
                {
                    return freq.char;
                }
            );
            var legend = this.encodeDictLegend(dictChars, maxLength - minCharIndexArrayStrLength);
            if (!legend)
                return;
            var figureLegendDelimiters =
            this.callGetFigureLegendDelimiters(getFigureLegendDelimiters, figurator, figures);
            var figureMaxLength = maxLength - legend.length;
            var figureLegend =
            this.replaceStringArray
            (figures, figureLegendDelimiters, figureMaxLength - minCharIndexArrayStrLength);
            if (!figureLegend)
                return;
            var keyFigureArrayStr =
            this.createCharKeyArrayString
            (input, charMap, figureMaxLength - figureLegend.length, keyFigureArrayDelimiters);
            if (!keyFigureArrayStr)
                return;
            var formatter = this.findDefinition(MAPPER_FORMATTER);
            var mapper = formatter('.indexOf(undefined)');
            var charIndexArrayStr =
            this.createJSFuckArrayMapping(keyFigureArrayStr, mapper, figureLegend);
            var output = this.createDictEncoding(legend, charIndexArrayStr, maxLength);
            return output;
        },

        encodeByDenseFigures:
        function (inputData, maxLength)
        {
            var output =
            this.encodeByDblDict
            (
                initMinFalseTrueCharIndexArrayStrLength,
                falseTrueFigurator,
                getDenseFigureLegendDelimiters,
                [FALSE_TRUE_DELIMITER],
                inputData,
                maxLength
            );
            return output;
        },

        encodeByDict:
        function (inputData, radix, amendings, maxLength)
        {
            var input = inputData.valueOf();
            var freqList = getFrequencyList(inputData);
            var coerceToInt =
            freqList.length &&
            freqList[0].count * APPEND_LENGTH_OF_DIGIT_0 > APPEND_LENGTH_OF_PLUS_SIGN;
            var reindexMap = createReindexMap(freqList.length, radix, amendings, coerceToInt);
            var charMap = createEmpty();
            var minCharIndexArrayStrLength = initMinFalseFreeCharIndexArrayStrLength(input);
            var dictChars = [];
            freqList.forEach
            (
                function (freq, index)
                {
                    var reindex = reindexMap[index];
                    var char = freq.char;
                    charMap[char] = reindex;
                    minCharIndexArrayStrLength += freq.count * reindex.sortLength;
                    dictChars[reindex.index] = char;
                }
            );
            var legend = this.encodeDictLegend(dictChars, maxLength - minCharIndexArrayStrLength);
            if (!legend)
                return;
            var charIndexArrayStr =
            this.createCharKeyArrayString
            (input, charMap, maxLength - legend.length, [FALSE_FREE_DELIMITER]);
            if (!charIndexArrayStr)
                return;
            var output =
            this.createDictEncoding
            (legend, charIndexArrayStr, maxLength, radix, amendings, coerceToInt);
            return output;
        },

        encodeBySparseFigures:
        function (inputData, maxLength)
        {
            var output =
            this.encodeByDblDict
            (
                initMinFalseFreeCharIndexArrayStrLength,
                falseFreeFigurator,
                getSparseFigureLegendDelimiters,
                [FALSE_FREE_DELIMITER],
                inputData,
                maxLength
            );
            return output;
        },

        encodeDictLegend:
        function (dictChars, maxLength)
        {
            if (!(maxLength < 0))
            {
                var input = dictChars.join('');
                var output =
                this.callStrategies
                (
                    input,
                    { forceString: true },
                    ['byCharCodesRadix4', 'byCharCodes', 'plain'],
                    'legend'
                );
                if (output && !(output.length > maxLength))
                    return output;
            }
        },

        encodeExpress:
        function (input, maxLength)
        {
            var unit = expressParse(input);
            if (unit)
            {
                var output;
                if (unit === true)
                {
                    if (!(maxLength < 0))
                        output = '';
                }
                else
                    output = this.replaceExpressUnit(unit, false, [], maxLength, REPLACERS);
                return output;
            }
        },

        encodeText:
        function (input, bond, forceString, unitPath, maxLength)
        {
            var output =
            this.callStrategies
            (
                input,
                { forceString: forceString, bond: bond },
                [
                    'byDenseFigures',
                    'bySparseFigures',
                    'byDictRadix5AmendedBy3',
                    'byDictRadix5AmendedBy2',
                    'byDictRadix4AmendedBy2',
                    'byDictRadix4AmendedBy1',
                    'byDictRadix3',
                    'byDictRadix4',
                    'byDict',
                    'byCharCodesRadix4',
                    'byCharCodes',
                    'plain',
                ],
                unitPath
            );
            if (output != null && !(output.length > maxLength))
                return output;
        },

        exec:
        function (input, wrapper, strategyNames, perfInfo)
        {
            var perfLog = this.perfLog = [];
            var output = this.callStrategies(input, { wrapper: wrapper }, strategyNames);
            if (perfInfo)
                perfInfo.perfLog = perfLog;
            delete this.perfLog;
            if (output == null)
                throw new _Error('Encoding failed');
            return output;
        },

        replaceFalseFreeArray: replaceFalseFreeArray,

        replaceStringArray:
        function (array, delimiters, maxLength)
        {
            var splitExpr = this.replaceString('split', { maxLength: maxLength, optimize: true });
            if (splitExpr)
            {
                maxLength -= splitExpr.length + 4;
                var optimalReplacement;
                var optimalSeparatorExpr;
                delimiters.forEach
                (
                    function (delimiter)
                    {
                        var str = array.join(delimiter.joiner);
                        var replacement = this.replaceStaticString(str, maxLength);
                        if (replacement)
                        {
                            var separatorExpr = this.replaceExpr(delimiter.separator);
                            var bulkLength = replacement.length + separatorExpr.length;
                            if (!(bulkLength > maxLength))
                            {
                                maxLength = bulkLength;
                                optimalReplacement = replacement;
                                optimalSeparatorExpr = separatorExpr;
                            }
                        }
                    },
                    this
                );
                if (optimalReplacement)
                {
                    var result =
                    optimalReplacement + '[' + splitExpr + '](' + optimalSeparatorExpr + ')';
                    return result;
                }
            }
        },
    };

    assignNoEnum(Encoder.prototype, protoSource);

    var FALSE_FREE_DELIMITER = { joiner: 'false', separator: 'false' };

    var FALSE_TRUE_DELIMITER = { joiner: '', separator: 'Function("return/(?=false|true)/")()' };

    var REPLACERS =
    {
        identifier:
        function (encoder, identifier, bondStrength, unitIndices, maxLength)
        {
            var unitPath = getUnitPath(unitIndices);
            var replacement =
            encoder.encodeAndWrapText('return ' + identifier, wrapWithCall, unitPath, maxLength);
            return replacement;
        },
        string:
        function (encoder, str, bond, forceString, unitIndices, maxLength)
        {
            var unitPath = getUnitPath(unitIndices);
            var replacement = encoder.encodeText(str, bond, forceString, unitPath, maxLength);
            return replacement;
        },
    };

    var falseFreeFigurator = createFigurator([''], 'false');
    var falseTrueFigurator = createFigurator(['false', 'true'], '');

    wrapWithCall =
    function (str)
    {
        var output = this.resolveConstant('Function') + '(' + str + ')()';
        return output;
    };
    wrapWithCall.forceString = false;

    wrapWithEval =
    function (str)
    {
        var output = this.replaceExpr('Function("return eval")()') + '(' + str + ')';
        return output;
    };
    wrapWithEval.forceString = true;
}
)();
