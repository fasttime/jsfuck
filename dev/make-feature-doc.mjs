import { Feature }                                      from '../lib/jscrewit.js';
import { getAvailabilityByFeature, getEngineEntries }   from './internal/engine-data.mjs';

function formatFeatureName(featureName)
{
    const TARGET = 'api-doc/interfaces/FeatureAll.md';

    const result = `<a href="${TARGET}#${featureName}"><code>${featureName}</code></a>`;
    return result;
}

function getCombinedDescription(engineEntry, versionIndex = 0)
{
    function getIndexedDescription(mapDescription)
    {
        for (let index = versionIndex; ; ++index)
        {
            const description = mapDescription(versions[index].description);
            if (description)
                return description;
        }
    }

    function getVersionedName(name, description)
    {
        const versionedName = description ? `${name} ${description}` : name;
        return versionedName;
    }

    let combinedDescription;
    const { name, versions } = engineEntry;
    if (Array.isArray(name))
    {
        combinedDescription =
        name.map
        (
            (name, subIndex) =>
            {
                const description = getIndexedDescription(description => description[subIndex]);
                const versionedName = getVersionedName(name, description);
                return versionedName;
            },
        )
        .join(', ');
    }
    else
    {
        const description = getIndexedDescription(description => description);
        combinedDescription = getVersionedName(name, description);
    }
    return combinedDescription;
}

function getImpliers(featureName, assignmentMap)
{
    const impliers = [];
    for (const otherFeatureName in assignmentMap)
    {
        if (featureName !== otherFeatureName && Feature[otherFeatureName].includes(featureName))
            impliers.push(otherFeatureName);
    }
    if (impliers.length)
        return impliers.sort();
}

function getVersioningFor(featureName, engineEntry)
{
    const availabilityInfo = getAvailabilityByFeature(featureName, engineEntry);
    const { firstAvail } = availabilityInfo;
    if (firstAvail != null)
    {
        const notes = [];
        if (firstAvail)
        {
            const availNote = getCombinedDescription(engineEntry, firstAvail);
            notes.push(availNote);
        }
        const { firstUnavail } = availabilityInfo;
        if (firstUnavail)
        {
            const unavailNote = `not in ${getCombinedDescription(engineEntry, firstUnavail)}`;
            notes.push(unavailNote);
        }
        const versioning = notes.join(', ');
        return versioning;
    }
}

export default
() =>
{
    const AND_FORMATTER = new Intl.ListFormat('en');

    function getComponentEntries(assignmentMap)
    {
        const componentEntries = [];
        const featureNames = Object.keys(assignmentMap).sort();
        for (const featureName of featureNames)
        {
            let componentEntry = formatFeatureName(featureName);
            const assigments = assignmentMap[featureName];
            const { impliers, versioning } = assigments;
            if (versioning || impliers)
            {
                componentEntry += ' (';
                if (impliers)
                {
                    const featureNameList =
                    AND_FORMATTER.format(impliers.map(formatFeatureName));
                    componentEntry += `implied by ${featureNameList}`;
                    if (versioning)
                        componentEntry += '; ';
                }
                if (versioning)
                    componentEntry += versioning;
                componentEntry += ')';
            }
            componentEntries.push(componentEntry);
        }
        return componentEntries;
    }

    const featureRowContentList =
    getEngineEntries()
    .map
    (
        engineEntry =>
        {
            const assignmentMap = { __proto__: null };
            Feature.ELEMENTARY.forEach
            (
                ({ name: featureName }) =>
                {
                    const versioning = getVersioningFor(featureName, engineEntry);
                    if (versioning != null)
                    {
                        const assignments = { versioning };
                        assignmentMap[featureName] = assignments;
                    }
                },
            );
            for (const featureName in assignmentMap)
            {
                const impliers = getImpliers(featureName, assignmentMap);
                if (impliers)
                    assignmentMap[featureName].impliers = impliers;
            }
            const label = getCombinedDescription(engineEntry);
            const componentEntries = getComponentEntries(assignmentMap);
            const featureRow = { label, componentEntries };
            return featureRow;
        },
    );
    const context = { featureRowContentList };
    return context;
};
