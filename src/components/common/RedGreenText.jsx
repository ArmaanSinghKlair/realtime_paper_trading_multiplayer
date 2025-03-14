import React from 'react';

/**
 * Make text green/red depending upon value. If < 0 then red else if > 0 then green.
 * @param {*} param0 
 * @returns 
 */
export const RedGreenText = ({valNum, children}) => {
    let itemValueClass = '';
    if(valNum != 0){
        if(valNum < 0){
            itemValueClass = 'text-danger';
        } else{
            itemValueClass = 'text-success';
        }
    }
  return (
    <span className={itemValueClass}>{children}</span>
  )
}
