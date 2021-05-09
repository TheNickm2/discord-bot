interface GlobalStore {
    tankAssessmentUsers: String[],
    healerAssessmentUsers: String[]
}

export const GlobalStore = {
    tankAssessmentUsers: [],
    healerAssessmentUsers: []
} as GlobalStore;