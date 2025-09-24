const bcrypt = require('bcrypt');
bcrypt.compare('123456', '$2b$10$Nf1f5a8I4dB7xow2lF5bv.rwfjRoZvC9uHZMMCs.GvfsHAPk.G0z2').then(console.log);