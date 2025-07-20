const createSpliter = (duration) => ({
    duration: [0],
    duration_from_last_point: duration,
    label: "spliter",
    type: "spliter"
});


export const split_data_per_24_hours = (dataOrigine, plannedStartDate) => {
    const data = [...dataOrigine];
    const date = new Date(plannedStartDate);
    const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    const offDuty = {
        duration: [seconds],
        duration_from_last_point: 0,
        label: "rest",
        type : "off-duty"
    }
    data.unshift(offDuty)
    let accumulated_duration = 0;
    let data_result = [];
    let data_result_temp = [];

    for(let i=0; i < data.length; i++) {
        const segment_duration = (data[i].duration_from_last_point) + (data[i-1]?.duration[0] ?? 0);
        accumulated_duration += segment_duration;
        let isToAdd = true;

        if(accumulated_duration > (24 * 3600)) {
            const lastPoint = data[i-1];
            
            if(!lastPoint) {
                data_result_temp.push(createSpliter(24 * 3600));
                data_result.push(data_result_temp); 
                
                // re-initiate-var
                data_result_temp = [];
                accumulated_duration = 0;

                const newCurrentPoint = {
                    ...data[i],
                    duration_from_last_point: (data[i].duration_from_last_point - (24 * 3600))
                };
                data_result_temp.push(newCurrentPoint);
                
                isToAdd = false;
            } else{
                if(((accumulated_duration - segment_duration) + lastPoint.duration[0]) >= (24 * 3600)) {
                    const true_duration = lastPoint.duration[0];
                    const rest_duration_day_cycle = ((24 * 3600) - (accumulated_duration - segment_duration));
                    const rest_duration = (true_duration - rest_duration_day_cycle);
                    const newLastPoint_final = { ...lastPoint, duration: [rest_duration] };
                    data_result_temp.push(newLastPoint_final);
                    data_result.push(data_result_temp);

                    // re-initiate-var
                    data_result_temp = [];
                    accumulated_duration = 0;
                    
                    const newLastPoint_initial = { 
                        ...lastPoint, 
                        duration_from_last_point: rest_duration, 
                        duration: [(true_duration - rest_duration)] 
                    };
                    data_result_temp.push(newLastPoint_initial);

                } else {
                    const addSpliter_to = (24 * 3600) - ((accumulated_duration - segment_duration) + lastPoint.duration[0])
                    data_result_temp.push(createSpliter(addSpliter_to));
                    data_result.push(data_result_temp);

                    // re-initiate-var
                    data_result_temp = [];
                    accumulated_duration = 0;

                    const newCurrentPoint = {
                        ...data[i],
                        duration_from_last_point: data[i].duration_from_last_point - addSpliter_to
                    };
                    data_result_temp.push(createSpliter(0));                    
                    data_result_temp.push(newCurrentPoint);                    
                    isToAdd = false;
                }
            }
        }
        if(isToAdd) data_result_temp.push(data[i]);
    }
    data_result.push(data_result_temp);

    return data_result;
};