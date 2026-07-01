const bcrypt = require('bcrypt');

const checkHash = async () => {
    const hash = "$2b$10$Zblkwb.ccxSDIENmDRitt.OVh0BD9XtK74KvOA0AMEWODiKrTVhf2";
    const isMatch = await bcrypt.compare('password123', hash);
    console.log("Matches password123?", isMatch);
    
    const isMatchAdmin = await bcrypt.compare('admin123', hash);
    console.log("Matches admin123?", isMatchAdmin);
};

checkHash();
