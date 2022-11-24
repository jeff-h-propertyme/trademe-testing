const fs = require('fs');

try {
    const jsonString = fs.readFileSync("./localities.json");
    const json = JSON.parse(jsonString);
    handleLocalities(json);
} catch (e) {
    console.log(e);
}

// Note: Data traversing can obviously be improved in terms of efficiency but is sufficient
// for the current data size
function handleLocalities(localities) {
    const suburbData = collectSuburbData(localities)
    const multipleNamedSuburbData = getMultipleNamedSuburbs(suburbData);
    const listOfSameNameSuburbLists = Object.values(multipleNamedSuburbData);

    const sameNameAndDistrictIdData = getSameNameSuburbWithSameDistricts(listOfSameNameSuburbLists);
    const sameNameAndDistrictNameData = getSameNameSuburbWithSameNameDistricts(listOfSameNameSuburbLists);

    const sameNameAndLocalityIdData = getSameNameSuburbWithSameLocality(listOfSameNameSuburbLists);
    const sameNameAndLocalityNameData = getSameNameSuburbWithSameNameLocalities(listOfSameNameSuburbLists);

    writeJsonDataToFile('suburbs', suburbData);
    writeJsonDataToFile('multiple-named-suburbs', multipleNamedSuburbData);
    writeJsonDataToFile('multiple-named-suburbs-and-district-ids', sameNameAndDistrictIdData);
    writeJsonDataToFile('multiple-named-suburbs-and-district-names', sameNameAndDistrictNameData);
    writeJsonDataToFile('multiple-named-suburbs-and-locality-ids', sameNameAndLocalityIdData);
    writeJsonDataToFile('multiple-named-suburbs-and-locality-names', sameNameAndLocalityNameData);
};

function collectSuburbData(localities) {
    const dataCollector = {};

    for (const locality of localities) {
        for (const district of locality.Districts) {
            for (const suburb of district.Suburbs) {

                if (!dataCollector[suburb.Name]) {
                    dataCollector[suburb.Name] = [];
                }

                dataCollector[suburb.Name].push({
                    LocalityName: locality.Name,
                    LocalityId: locality.LocalityId,
                    DistrictName: district.Name,
                    DistrictId: district.DistrictId,
                    SuburbName: suburb.Name,
                    SuburbId: suburb.SuburbId
                });
            }
        }
    }

    return dataCollector;
}

function getMultipleNamedSuburbs(suburbData) {
    const suburbsWithSameName = Object.values(suburbData).filter(suburbList => suburbList.length > 1);
    const dataCollector = {};
    for (const listForSuburb of suburbsWithSameName) {
        dataCollector[listForSuburb[0].SuburbName] = listForSuburb;
    }
    return dataCollector;
}

function getSameNameSuburbWithSameDistricts(listOfSameNameSuburbLists) {
    const dataCollector = {};

    for (const listForSuburb of listOfSameNameSuburbLists) {
        const districtsForSuburbData = new Map();
        for (const suburb of listForSuburb) {
            const existingList = districtsForSuburbData.get(suburb.DistrictId);

            if (!existingList) {
                districtsForSuburbData.set(suburb.DistrictId, [suburb]);
                continue;
            }

            existingList.push(suburb);
            districtsForSuburbData.set(suburb.DistrictId, existingList);
        }

        districtsForSuburbData.forEach(function(value, key) {
            if (value.length > 1) {
                dataCollector[value[0].SuburbName] = value;
            }
        })
    }

    return dataCollector;
};

function getSameNameSuburbWithSameNameDistricts(listOfSameNameSuburbLists) {
    const dataCollector = {};

    for (const listForSuburb of listOfSameNameSuburbLists) {
        const districtsForSuburbData = {};
        for (const suburb of listForSuburb) {
            if (!districtsForSuburbData[suburb.DistrictName]) {
                districtsForSuburbData[suburb.DistrictName] = [];
            }

            districtsForSuburbData[suburb.DistrictName].push(suburb);
        }

        for (const list of Object.values(districtsForSuburbData)) {
            if (list.length > 1) {
                dataCollector[list[0].SuburbName] = list;
            }
        }
    }

    return dataCollector;
};

function getSameNameSuburbWithSameLocality(listOfSameNameSuburbLists) {
    const dataCollector = {};

    for (const listForSuburb of listOfSameNameSuburbLists) {
        const districtsForSuburbData = new Map();
        for (const suburb of listForSuburb) {
            const existingList = districtsForSuburbData.get(suburb.LocalityId);

            if (!existingList) {
                districtsForSuburbData.set(suburb.LocalityId, [suburb]);
                continue;
            }

            existingList.push(suburb);
            districtsForSuburbData.set(suburb.LocalityId, existingList);
        }

        districtsForSuburbData.forEach(function(value, key) {
            if (value.length > 1) {
                dataCollector[value[0].SuburbName] = value;
            }
        })
    }

    return dataCollector;
};

function getSameNameSuburbWithSameNameLocalities(listOfSameNameSuburbLists) {
    const dataCollector = {};

    for (const listForSuburb of listOfSameNameSuburbLists) {
        const districtsForSuburbData = {};
        for (const suburb of listForSuburb) {
            if (!districtsForSuburbData[suburb.LocalityName]) {
                districtsForSuburbData[suburb.LocalityName] = [];
            }

            districtsForSuburbData[suburb.LocalityName].push(suburb);
        }

        for (const list of Object.values(districtsForSuburbData)) {
            if (list.length > 1) {
                dataCollector[list[0].SuburbName] = list;
            }
        }
    }

    return dataCollector;
};

function writeJsonDataToFile(fileName, data) {
    const fullFileName = fileName + '.json';
    try {
        const stringifiedFormmatedJson = JSON.stringify(data, null, 2);
        fs.writeFileSync(fullFileName, stringifiedFormmatedJson);
        console.log('File successfully written to ' + fullFileName)
    } catch (e) {
        console.log('ERROR writing to ' + fullFileName);
    }
}
