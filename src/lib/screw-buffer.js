import createClusteringPlan                     from './clustering-plan';
import { _Math_max, _Math_pow, assignNoEnum }   from './obj-utils';
import Solution                                 from './solution';
import { DynamicSolution, SolutionType }        from 'novem';
import { SimpleSolution } from 'novem';

// This implementation assumes that all numeric solutions have an outer plus, and all other
// character solutions have none.

export var APPEND_LENGTH_OF_DIGIT_0     = 6;
export var APPEND_LENGTH_OF_DOT         = 73;
export var APPEND_LENGTH_OF_FALSE       = 4;
export var APPEND_LENGTH_OF_EMPTY       = 3; // Append length of the empty array.
export var APPEND_LENGTH_OF_MINUS       = 136;
export var APPEND_LENGTH_OF_PLUS_SIGN   = 71;
export var APPEND_LENGTH_OF_SMALL_E     = 26;

export var APPEND_LENGTH_OF_DIGITS = [APPEND_LENGTH_OF_DIGIT_0, 8, 12, 17, 22, 27, 32, 37, 42, 47];

export var SCREW_NORMAL             = 0;
export var SCREW_AS_STRING          = 1;
export var SCREW_AS_BONDED_STRING   = 2;

export var ScrewBuffer;

export var optimizeSolutions;

(function ()
{
    function appendSolutions(solution, solutions, offset, count)
    {
        for (var limit = offset + count; offset < limit; ++offset)
        {
            var subSolution = solutions[offset];
            solution.append(subSolution);
        }
    }

    function canSplitRightEndForFree(solutions, lastBridgeIndex)
    {
        var rightEndIndex = lastBridgeIndex + 1;
        var rightEndLength = solutions.length - rightEndIndex;
        var result =
        rightEndLength > 2 || rightEndLength > 1 && !isUnluckyRightEnd(solutions, rightEndIndex);
        return result;
    }

    function findLastBridge(solutions)
    {
        for (var index = solutions.length; index--;)
        {
            var solution = solutions[index];
            if (solution.bridge)
                return index;
        }
    }

    function findNextBridge(solutions, index)
    {
        for (;; ++index)
        {
            var solution = solutions[index];
            if (solution.bridge)
                return index;
        }
    }

    function findSplitIndex(solutions, intrinsicSplitCost, firstBridgeIndex, lastBridgeIndex)
    {
        var index = 1;
        var lastIndex = firstBridgeIndex - 1;
        var optimalSplitCost = getSplitCostAt(solutions, index, true, index === lastIndex);
        var splitIndex = index;
        while (++index < firstBridgeIndex)
        {
            var splitCost = getSplitCostAt(solutions, index, false, index === lastIndex);
            if (splitCost < optimalSplitCost)
            {
                optimalSplitCost = splitCost;
                splitIndex = index;
            }
        }
        if
        (
            optimalSplitCost + intrinsicSplitCost < 0 &&
            !(optimalSplitCost > 0 && canSplitRightEndForFree(solutions, lastBridgeIndex))
        )
            return splitIndex;
    }

    function gatherGroup(solutions, groupBond, groupForceString, bridgeUsed)
    {
        function appendRightGroup(groupCount)
        {
            bridgedPartArray.push(sequenceAsString(solutions, index, groupCount, '[[]]'), ')');
        }

        var solution = new DynamicSolution();
        var multiPart;
        var count = solutions.length;
        if (count > 1)
        {
            var lastBridgeIndex;
            if (bridgeUsed)
                lastBridgeIndex = findLastBridge(solutions);
            multiPart = lastBridgeIndex == null;
            if (multiPart)
                appendSolutions(solution, solutions, 0, count);
            else
            {
                var bridgeIndex = findNextBridge(solutions, 0);
                var index;
                if (bridgeIndex > 1)
                {
                    var intrinsicSplitCost = groupForceString ? -3 : groupBond ? 2 : 0;
                    index =
                    findSplitIndex(solutions, intrinsicSplitCost, bridgeIndex, lastBridgeIndex);
                }
                multiPart = index != null;
                if (multiPart)
                {
                    // Keep the first solutions out of the bridged context to reduce output length.
                    appendSolutions(solution, solutions, 0, index);
                }
                else
                    index = 0;
                var bridgedPartArray =
                ['[', sequenceAsString(solutions, index, bridgeIndex - index, '[]'), ']'];
                for (;;)
                {
                    bridgedPartArray.push(solutions[bridgeIndex].bridge, '(');
                    index = bridgeIndex + 1;
                    if (bridgeIndex === lastBridgeIndex)
                        break;
                    bridgeIndex = findNextBridge(solutions, index);
                    appendRightGroup(bridgeIndex - index);
                }
                var groupCount;
                var rightEndCount = count - index;
                if (groupForceString && !multiPart && rightEndCount > 1)
                {
                    groupCount = rightEndCount > 2 && isUnluckyRightEnd(solutions, index) ? 2 : 1;
                    multiPart = true;
                }
                else
                    groupCount = rightEndCount;
                appendRightGroup(groupCount);
                var bridgedReplacement = bridgedPartArray.join('');
                var bridgedSolution =
                new SimpleSolution(undefined, bridgedReplacement, SolutionType.OBJECT);
                solution.append(bridgedSolution);
                index += groupCount;
                appendSolutions(solution, solutions, index, count - index);
            }
        }
        else
        {
            solution.append(solutions[0]);
            multiPart = false;
        }
        if (!solution.isString && groupForceString)
        {
            solution.append(EMPTY_SOLUTION);
            multiPart = true;
        }
        var str = solution.replacement;
        if (groupBond && multiPart)
            str = '(' + str + ')';
        return str;
    }

    function getArithmeticJoinCost(solution0, solution1)
    {
        var joinCost = solution0.isUndefined && solution1.isUndefined ? 3 : 2;
        return joinCost;
    }

    function getSplitCostAt(solutions, index, leftmost, rightmost)
    {
        var solutionCenter = solutions[index];
        var solutionLeft;
        var solutionRight;
        var splitCost =
        (
            rightmost && solutionCenter.isUndefined ?
            3 :
            isArithmeticJoin(solutionCenter, solutionRight = solutions[index + 1]) ?
            getArithmeticJoinCost(solutionCenter, solutionRight) -
            (solutionRight.isWeak ? 2 : 0) :
            0
        ) -
        (
            leftmost &&
            isArithmeticJoin(solutionCenter, solutionLeft = solutions[index - 1]) ?
            getArithmeticJoinCost(solutionLeft, solutionCenter) :
            solutionCenter.isWeak ? 2 : 0
        );
        return splitCost;
    }

    function isArithmeticJoin(solution0, solution1)
    {
        var result = solution0.isArithmetic && solution1.isArithmetic;
        return result;
    }

    function isUnluckyRightEnd(solutions, firstIndex)
    {
        var result = solutions[firstIndex].isUndefined && !solutions[firstIndex + 1].isUndefined;
        return result;
    }

    function sequenceAsString(solutions, offset, count, emptyReplacement)
    {
        var str;
        if (count)
        {
            var solution = new DynamicSolution();
            appendSolutions(solution, solutions, offset, count);
            if (solution.isUndefined)
                solution.prepend(EMPTY_SOLUTION);
            str = solution.replacement;
        }
        else
            str = emptyReplacement;
        return str;
    }

    var EMPTY_SOLUTION = new Solution('', '[]', SolutionType.OBJECT);

    ScrewBuffer =
    function (screwMode, groupThreshold, optimizerList)
    {
        function gather(offset, count, groupBond, groupForceString)
        {
            var end = offset + count;
            var groupSolutions = solutions.slice(offset, end);
            if (optimizerList.length)
                optimizeSolutions(optimizerList, groupSolutions, groupBond, groupForceString);
            var str = gatherGroup(groupSolutions, groupBond, groupForceString, bridgeUsed);
            return str;
        }

        var bridgeUsed;
        var length = -APPEND_LENGTH_OF_EMPTY;
        var maxSolutionCount = _Math_pow(2, groupThreshold - 1);
        var solutions = [];
        var bond = screwMode === SCREW_AS_BONDED_STRING;
        var forceString = screwMode !== SCREW_NORMAL;

        assignNoEnum
        (
            this,
            {
                append:
                function (solution)
                {
                    if (solutions.length >= maxSolutionCount)
                        return false;
                    if (solution.bridge)
                        bridgeUsed = true;
                    solutions.push(solution);
                    var appendLength = solution.appendLength;
                    optimizerList.forEach
                    (
                        function (optimizer)
                        {
                            var currentAppendLength = optimizer.appendLengthOf(solution);
                            if (currentAppendLength < appendLength)
                                appendLength = currentAppendLength;
                        }
                    );
                    length += appendLength;
                    return true;
                },
                get length()
                {
                    return length;
                },
                toString:
                function ()
                {
                    function collectOut(offset, count, maxGroupCount, groupBond)
                    {
                        var str;
                        if (count <= groupSize + 1)
                            str = gather(offset, count, groupBond);
                        else
                        {
                            maxGroupCount /= 2;
                            var halfCount = groupSize * maxGroupCount;
                            var capacity = 2 * halfCount - count;
                            var leftEndCount =
                            _Math_max
                            (
                                halfCount - capacity + capacity % (groupSize - 1),
                                (maxGroupCount / 2 ^ 0) * (groupSize + 1)
                            );
                            str =
                            collectOut(offset, leftEndCount, maxGroupCount) +
                            '+' +
                            collectOut
                            (offset + leftEndCount, count - leftEndCount, maxGroupCount, true);
                            if (groupBond)
                                str = '(' + str + ')';
                        }
                        return str;
                    }

                    var str;
                    var solutionCount = solutions.length;
                    if (solutionCount < 2)
                    {
                        var solution = solutions[0] || EMPTY_SOLUTION;
                        str = solution.replacement;
                        if (forceString && !solution.isString)
                            str += '+[]';
                        if (bond && solution.type !== SolutionType.STRING)
                            str = '(' + str + ')';
                    }
                    else
                    {
                        if (solutionCount <= groupThreshold)
                            str = gather(0, solutionCount, bond, forceString);
                        else
                        {
                            var groupSize = groupThreshold;
                            var maxGroupCount = 2;
                            for (;;)
                            {
                                --groupSize;
                                var maxSolutionCountForDepth = groupSize * maxGroupCount;
                                if (solutionCount <= maxSolutionCountForDepth)
                                    break;
                                maxGroupCount *= 2;
                            }
                            str = collectOut(0, solutionCount, maxGroupCount, bond);
                        }
                    }
                    return str;
                },
            }
        );
    };

    optimizeSolutions =
    function (optimizerList, solutions, bond, forceString)
    {
        var plan = createClusteringPlan();
        optimizerList.forEach
        (
            function (optimizer)
            {
                optimizer.optimizeSolutions(plan, solutions, bond, forceString);
            }
        );
        var clusters = plan.conclude();
        clusters.forEach
        (
            function (cluster)
            {
                var clusterer = cluster.data;
                var solution = clusterer();
                solutions.splice(cluster.start, cluster.length, solution);
            }
        );
    };
}
)();
