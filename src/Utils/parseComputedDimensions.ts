export const parseComputedDimensions = (computedDimension: string) : number => {
    return parseInt(computedDimension.replaceAll('px', ''))
}

export const getOptionalDimesionsString = (dim: string | undefined) : string => {
    return dim ?? "0px";
}

export const constGetOptionalDimensionsNumber = (dim: number | undefined) : number => {
    return dim ?? 0;
}

export const parseOptionalDimensions = (dim: string | undefined) : number => {
    return parseComputedDimensions(getOptionalDimesionsString(dim));
}
