const fs = require('fs');

try {
    const jsonString = fs.readFileSync("./localities.json");
    const json = JSON.parse(jsonString);
    handleLocalities(json);
} catch (e) {
    console.log(e);
}

function handleLocalities(localities) {
    const suburbData = collectSuburbData(localities)

    const multipleNamedSuburbData = getMultipleNamedSuburbsData(suburbData);

    writeJsonDataToFile('suburbs', suburbData);
    writeJsonDataToFile('multiple-named-suburbs', multipleNamedSuburbData);
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

function getMultipleNamedSuburbsData(suburbData) {
    const suburbsWithSameName = Object.values(suburbData).filter(suburbList => suburbList.length > 1);
    const dataCollector = {};
    for (const listForSuburb of suburbsWithSameName) {
        dataCollector[listForSuburb[0].SuburbName] = listForSuburb;
    }
    return dataCollector;
}

function writeJsonDataToFile(fileName, data) {
    const fullFileName = fileName + '.json';
    const stringifiedFormmatedJson = JSON.stringify(data, null, 2);
    fs.writeFileSync(fullFileName, stringifiedFormmatedJson);
    console.log('File successfully written to ' + fullFileName)
}
