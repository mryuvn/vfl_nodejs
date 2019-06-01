var express = require("express");
var jsonParser = require("body-parser").json();
var router = express.Router();

var api_secur = require('../common/api_secur');
var db_model = require('../models/db_models');
var func = require('../common/func');

router.get("/", (req, res) => res.send("This is Visa Orders API"));

router.get("/get-data", (req, res) => {
    var secur_key = req.query.secur_key;
    if (secur_key == api_secur.secur) {
        var db_table = 'visa_orders';
        var fields = '*';
        var where = req.query.where;
        var orderBy = ' ORDER BY time DESC';
        var limit = req.query.limit;
        db_model.getData(db_table, fields, where, orderBy, limit)
            .then(data => {
                var newData = [];
                var testData = [];
                data.forEach(e => {
                    //Set OrderNum
                    if (e.num) {
                        var num = e.num;
                    } else {
                        var num = e.order_num;
                    }

                    e.orderCode = e.year.slice(2) + num + '' + e.code;
                    e.orderRef = e.orderCode + '/VFL-VISA';

                    if (num < 10) {
                        var zero = '0000';
                    } else if (num < 100) {
                        var zero = '000'
                    } else if (num < 1000) {
                        var zero = '00'
                    } else if (num < 10000) {
                        var zero = '0'
                    } else {
                        var zero = ''
                    }
                    e.order_num = zero + num;

                    //Set customerData
                    if (e.customerData) {
                        var customerData = e.customerData;
                        var customerDataArr = e.customerData.split(' || ');
                        var customerNameArr = customerDataArr[0].split(' | ');
                        if (customerNameArr.length > 1) {
                            var deputy = customerNameArr[1];
                        } else {
                            var deputy = '';
                        }
                        if (customerDataArr.length > 2) {
                            var tels = customerDataArr[1];
                            var emails = customerDataArr[2];
                        } else {
                            var tels = '';
                            var emails = '';
                        }
                        e.customerData = {
                            ten: customerNameArr[0],
                            deputy: deputy,
                            tel: tels,
                            email: emails
                        }
                    }

                    //Set contacts
                    e.tels = [];
                    e.newCustomerTels = [];
                    if (e.tel) {
                        var tels = e.tel.split(' | ');
                        tels.forEach(tel => {
                            let telArr = tel.split('-');
                            if (telArr.length > 1) {
                                var telData = {
                                    code: telArr[0],
                                    number: telArr[1],
                                }
                            } else {
                                var telData = {
                                    code: '',
                                    number: telArr[0]
                                }
                            }
                            e.tels.push(telData);
                            e.newCustomerTels.push(telData);
                        });
                    }

                    e.emails = [];
                    e.newCustomerEmails = [];
                    if (e.email) {
                        var emails = e.email.split(' | ');
                        emails.forEach(em => {
                            e.emails.push({
                                mail: em
                            });
                            e.newCustomerEmails.push({
                                mail: em
                            })
                        });
                    }

                    //Set Order details
                    if (e.orderName) {
                        var orderNameArr = e.orderName.split(' | ');
                        if (orderNameArr.length == 3) {
                            e.orderName = {
                                ten: orderNameArr[0],
                                name: orderNameArr[1],
                                code: orderNameArr[2]
                            }
                        } else {
                            e.orderName = {
                                ten: orderNameArr[0],
                                name: '',
                                code: ''
                            }
                        }
                    }

                    //Set Prices & Payments
                    e.ty_gia = parseInt(e.ty_gia);
                    if (!e.ty_gia) {
                        var tygia = 1;
                    } else {
                        var tygia = e.ty_gia;
                    }
                    if (e.phi_cmtc) {
                        if (e.loai_tien == 'VND') {
                            var phiCMTC = parseInt(e.phi_cmtc);
                        } else {
                            var phiCMTC = parseInt(e.phi_cmtc) / tygia;
                        }
                    } else {
                        var phiCMTC = 0;
                    }
                    if (e.phi_ls) {
                        var phiLS = parseInt(e.phi_ls);
                    } else {
                        var phiLS = 0;
                    }
                    if (e.phi_dt) {
                        var phiDT = parseInt(e.phi_dt);
                    } else {
                        var phiDT = 0;
                    }
                    if (e.phi_bh) {
                        var phiBH = parseInt(e.phi_bh);
                    } else {
                        var phiBH = 0;
                    }
                    if (e.phi_vc) {
                        var phiVC = parseInt(e.phi_vc);
                    } else {
                        var phiVC = 0;
                    }
                    if (e.phi_dv) {
                        var phiDV = parseInt(e.phi_dv);
                    } else {
                        var phiDV = 0;
                    }
                    if (e.phi_khac) {
                        var phiKHAC = parseInt(e.phi_khac);
                    } else {
                        var phiKHAC = 0;
                    }

                    if (e.cat == 1) {
                        var totalFee = phiLS + phiDT + phiBH + phiVC + phiDV + phiKHAC + phiCMTC;
                    } else if (e.cat == 2) {
                        var totalFee = (phiDT * phiBH) + (phiDV * phiKHAC)
                    } else if (e.cat == 3) {
                        var totalFee = phiDV * phiKHAC;
                    } else if (e.cat == 4) {
                        var totalFee = phiDV * phiKHAC;
                    } else {
                        var totalFee = 0;
                    }
                    e.totalFee = totalFee;

                    if (e.receivedAmount) {
                        var receivedVndArr = [];
                        var receivedAmounts = e.receivedAmount.split(' | ');
                        receivedAmounts.forEach(amount => {
                            let values = amount.split(' ');
                            let amountNumber = values[0];
                            if (values[1] == 'VND') {
                                var receivedAmountVnd = parseInt(values[0]);
                            } else {
                                if (values[1] == e.loai_tien) {
                                    var receivedAmountVnd = parseInt(values[0]) * tygia;
                                } else {
                                    var receivedAmountVnd = values[0] * values[2];
                                }
                            }
                            receivedVndArr.push(receivedAmountVnd);
                        });
                        var totalpaid = receivedVndArr.reduce(func.add, 0);
                        if (e.loai_tien == 'VND') {
                            e.totalpaid = totalpaid;
                        } else {
                            e.totalpaid = totalpaid / tygia;
                        }
                    } else {
                        e.totalpaid = 0;
                    }

                    e.due = e.totalFee - e.totalpaid;

                    e.paymentFeesArr = [];
                    if (e.paymentAmount) {
                        let paymentFees = e.paymentAmount.split(' || ');
                        let paymentAmountsArr = [];
                        paymentFees.forEach(pm => {
                            var pmArr = pm.split(' | ');
                            let pmData = {
                                name: pmArr[0],
                                amount: pmArr[1]
                            }
                            e.paymentFeesArr.push(pmData);
                            let amount = parseInt(pmArr[1]);
                            paymentAmountsArr.push(amount);
                            e.totalPayment = paymentAmountsArr.reduce(func.add, 0);
                        });
                    } else {
                        e.totalPayment = 0;
                    }

                    if (e.loai_tien == 'VND') {
                        e.profit = e.totalFee - e.totalPayment;
                    } else {
                        e.profit = e.totalFee * parseInt(e.ty_gia) - e.totalPayment;
                    }
                    //Set Prices & Payments

                    //set Process status
                    if (e.hien_thi == 0) {
                        var process1 = 'Đang chờ';
                        var process2 = 'Pending';
                        var processColor = '#039be5';
                    } else if (e.hien_thi == 1) {
                        var process1 = 'Đang xử lý';
                        var process2 = 'Handling';
                        var processColor = '#006cb6';
                    } else if (e.hien_thi == 2) {
                        var process1 = 'Xử lý xong';
                        var process2 = 'Done';
                        var processColor = '#fe4d40';
                    } else if (e.hien_thi == 3) {
                        var process1 = 'Đã nộp LS';
                        var process2 = 'Submited';
                        var processColor = '#da291c';
                    } else if (e.hien_thi == 4) {
                        var process1 = 'Đã kết thúc';
                        var process2 = 'Finished';
                        var processColor = '#ad0909';
                    } else {
                        var process1 = 'Huỷ';
                        var process2 = 'Canceled';
                        var processColor = '#999';
                    }
                    e.process = {
                        status: e.hien_thi,
                        ten: process1,
                        name: process2,
                        color: processColor
                    }
                    e.processFilter = process2;

                    if (e.result > 0) {
                        if (e.cat == 1) {
                            if (e.result == 1) {
                                var resultContent = 'Đậu Visa';
                            } else if (e.result == 2) {
                                var resultContent = 'Rớt Visa';
                            } else {
                                var resultContent = '';
                            }
                        } else {
                            if (e.result == 1) {
                                var resultContent = 'Thành công';
                            } else if (e.result == 2) {
                                var resultContent = 'Thất bại';
                            } else {
                                var resultContent = '';
                            }
                        }
                        e.resultData = {
                            value: e.result,
                            content: resultContent
                        }
                    } else if (e.result == -1) {
                        e.resultData = {
                            value: e.result,
                            content: 'Rút lại Hồ sơ'
                        }
                    } else if (e.result == -9) {
                        e.resultData = {
                            value: e.result,
                            content: e.result_note
                        }
                    } else {
                        if (e.chuyen_den == 'Nội dung khác') {
                            e.resultData = {
                                value: -9,
                                content: e.tinh_trang
                            }
                            e.result_note = e.tinh_trang;
                        } else {
                            if (e.chuyen_den == 'Đậu Visa' || e.chuyen_den == 'Hoàn thành' || e.chuyen_den == 'Thành công') {
                                e.resultData = {
                                    value: 1,
                                    content: e.chuyen_den
                                }
                            } else if (e.chuyen_den == 'Không thành công' || e.chuyen_den == 'Rớt Visa') {
                                e.resultData = {
                                    value: 2,
                                    content: e.chuyen_den
                                }
                            } else if (e.chuyen_den === 'Rút lại Hồ sơ') {
                                e.resultData = {
                                    value: -1,
                                    content: e.chuyen_den
                                }
                            } else {
                                e.resultData = undefined;
                            }
                        }
                    }

                    if (e.hien_thi == -1) {
                        if (e.result_note) {
                            e.cancel_reason = e.result_note;
                        } else {
                            e.cancel_reason = e.tinh_trang;
                        }
                    } else {
                        e.cancel_reason = '';
                    }
                    //set Process status

                    //Set Users
                    if (e.userData) {
                        var userData = e.userData.split(' | ');
                        e.userData = {
                            nickname: userData[0],
                            fullname: userData[1]
                        }
                    }

                    if (e.handlerData) {
                        var handlerData = e.handlerData.split(' | ');
                        e.handlerData = {
                            nickname: handlerData[0],
                            fullname: handlerData[1]
                        }
                    }

                    if (e.advisorData) {
                        var advisorData = e.advisorData.split(' | ');
                        e.advisorData = {
                            nickname: advisorData[0],
                            fullname: advisorData[1]
                        }
                    }
                    //Set Users

                    if (e.office) {
                        const arr = e.office.split(' | ');
                        e.officeId = arr[0];
                        if (arr.length > 0) {
                            e.officeData = {
                                id: arr[0],
                                name: arr[1]
                            }
                        }
                    } else {
                        e.officeId = '';
                    }

                    e.documentsIncludedData = [];
                    if (e.documentsIncluded) {
                        const documentsIncludedDataArr = e.documentsIncluded.split(' |doc| ');
                        documentsIncludedDataArr.forEach(item => {
                            const docArr = item.split(' |val| ');
                            if (docArr.length == 9) {
                                const doc = {
                                    menu: docArr[0],
                                    type: docArr[1],
                                    id: docArr[2],
                                    docType: docArr[3],
                                    docCategory: docArr[4],
                                    name: docArr[5],
                                    number: docArr[6],
                                    return: docArr[7],
                                    note: docArr[8]
                                }
                                e.documentsIncludedData.push(doc);
                            }
                        });
                    }

                    e.filterString = e.ten + ' ' + func.accented_characters(e.ten) + ' ' + e.tel + ' ' + e.email + ' ' + e.orderCode + ' ' + customerData;

                    newData.push(e);
                });

                res.json({
                    "mess": 'ok',
                    "data": newData
                });
                // res.json(testData);
            }).catch(err => {
                res.json({
                    "mess": "fail",
                    "err": err
                });
            });
    } else {
        res.json({
            "mess": "fail",
            "err": "No security key!"
        });
    }
});

module.exports = router;