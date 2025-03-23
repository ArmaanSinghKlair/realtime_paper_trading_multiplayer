import React from 'react';

/**
 * Make text green/red depending upon value. If < 0 then red else if > 0 then green.
 * @param {*} param0 
 * @returns 
 */
export const RedGreenText = ({valNum, children}) => {
    let numericalVal = valNum;
    if(!numericalVal){
      //assume children is number itself
      numericalVal = children;
    }
    let itemValueClass = '';
    if(numericalVal != 0){
        if(numericalVal < 0){
            itemValueClass = 'text-danger';
        } else{
            itemValueClass = 'text-success';
        }
    }
  return (
    <span className={itemValueClass}>{numericalVal > 0 && '+'}{children}</span>
  )
}
