import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default {
    build: {
        rollupOptions: {
            input: {
                index: resolve(root, "index.html"),
                employeeDashboard: resolve(root, "employee-dashboard.html"),
                adminDashboard: resolve(root, "admin-dashboard.html"),
            },
        },
    },
};
