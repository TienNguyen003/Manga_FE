import httpRequest from '~/lib/httpRequest';

const url = '/files';

export const fileService = {
    uploadSingleFile: (file, folderName) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderName', folderName);
        return httpRequest.post(url + '/upload-single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    uploadMultipleFiles: (files, folderName) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folderName', folderName);
        return httpRequest.post(url + '/upload-multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};
