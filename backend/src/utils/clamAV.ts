import NodeClam from 'clamscan';

export async function scanFile(filePath: string | undefined) {
    console.log(`Attempting virus scan for ${filePath}`);
  
    const clamscan = await new NodeClam().init({
      removeInfected: true,
      debugMode: false,
      scanRecursively: false,
      clamdscan: {
        host: '127.0.0.1', // If you want to connect locally but not through socket
        port: 3310, // Because, why not
        timeout: 60000, // 5 minutes
        localFallback: false, // Do no fail over to binary-method of scanning
        multiscan: false, // You hate speed and multi-threaded awesome-sauce
        reloadDb: true, // You want your scans to run slow like with clamscan
        active: false, // you don't want to use this at all because it's evil
        bypassTest: true, // Don't check to see if socket is available. You should probably never set this to true.
      }
    });
    const { isInfected, viruses } = await clamscan.isInfected(filePath);
  
    return { isInfected, viruses };
  };