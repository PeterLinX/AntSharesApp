//规范：Function文件中只存放全局函数

function formIsValid(formId: string): boolean
{
    let demo = $('#' + formId) as any;
    if (!demo.valid())
    {
        return false;
    }
    else
    {
        return true;
    }
}

function convert_keyup(obj)
{
    let n = obj.value.replace(/,/g, "") as string;

    let str = n.split('.');
    if (str.length > 2)
        return;
    let z = str[0].split('').reverse().join('');
    let z1 = "";
    for (let i = 0; i < z.length; i++)
    {
        z1 = z1 + z[i];
        if ((i + 1) % 3 == 0 && i < z.length - 1)
            z1 = z1 + ",";
    }
    z1 = z1.split('').reverse().join('');

    let result = z1;
    if (str.length == 2)
    {
        let f = str[1];
        result = result + "." + f;
    }
    obj.value = result;
}

function convert_keydown(obj)
{
    setTimeout(() => { convert_keyup(obj) }, 10);
}
