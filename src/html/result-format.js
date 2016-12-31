(function (root)
{
    'use strict';
    
    function formatItem(value)
    {
        var text;
        if (typeof value === 'string')
            text = '"' + value + '"';
        else if (value === 0 && 1 / value < 0)
            text = '-0';
        else if (Array.isArray(value))
        {
            try
            {
                text = value.length ? '[…]' : '[]';
            }
            catch (error)
            { }
        }
        else
        {
            try
            {
                text = String(value);
            }
            catch (error)
            { }
        }
        return text;
    }
    
    function getStringTag(value)
    {
        var str;
        try
        {
            str = Object.prototype.toString.call(value);
        }
        catch (error)
        {
            return;
        }
        var strTag = str.slice(8, -1);
        return strTag;
    }
    
    root.formatValue =
        function (value)
        {
            var text;
            if (Array.isArray(value))
            {
                try
                {
                    text = '[' + value.map(formatItem).join(', ') + ']';
                }
                catch (error)
                { }
            }
            else
                text = formatItem(value);
            return text;
        };
    
    root.formatValueType =
        function (value)
        {
            var valueType;
            if (value !== null)
            {
                var type = typeof value;
                // document.all has type "undefined".
                if  (type === 'function' || type === 'object' || type === 'undefined')
                {
                    var strTag = getStringTag(value);
                    switch (strTag)
                    {
                    case 'Array':
                        switch (value.length)
                        {
                        case 0:
                            valueType = 'an empty array';
                            break;
                        case 1:
                            valueType = 'a one element array';
                            break;
                        default:
                            valueType = 'an array';
                            break;
                        }
                        break;
                    case 'Date':
                        valueType = 'a date';
                        break;
                    default:
                        // RegExp objects have type "function" in older Android Browsers
                        if (value instanceof RegExp)
                            valueType = 'a regular expression';
                        else if (type === 'function')
                            valueType = 'a function';
                        else
                            valueType = 'an object';
                        break;
                    }
                }
            }
            return valueType;
        };
}
)(this);